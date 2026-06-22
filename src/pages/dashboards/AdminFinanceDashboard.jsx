import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { DollarSign, CreditCard, BookOpen, TrendingUp, ExternalLink } from 'lucide-react';

const AdminFinanceDashboard = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, perCourse: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, transRes] = await Promise.all([
        paymentService.getRevenueStats(),
        paymentService.getAllTransactions({ page: 1, limit: 100 })
      ]);
      setStats(statsRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error('Failed to fetch finance data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };

  if (loading) return <div className="p-8 text-center">Loading finance dashboard...</div>;

  const totalTransactions = transactions.length;
  const paidTransactions = transactions.filter(t => t.status === 'paid');
  const avgOrderValue = paidTransactions.length > 0 
    ? stats.totalRevenue / paidTransactions.length 
    : 0;

  // Prepare data for charts
  const chartData = stats.perCourse.map(c => ({
    name: c.title.substring(0, 15) + (c.title.length > 15 ? '...' : ''),
    revenue: c.total_revenue / 100
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Financial Overview</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex items-center">
          <div className="p-4 bg-primary/10 rounded-full mr-4 text-primary">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
          </div>
        </div>
        
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex items-center">
          <div className="p-4 bg-primary/10 rounded-full mr-4 text-primary">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Transactions</p>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex items-center">
          <div className="p-4 bg-primary/10 rounded-full mr-4 text-primary">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Avg Order Value</p>
            <p className="text-2xl font-bold">{formatPrice(avgOrderValue)}</p>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex items-center">
          <div className="p-4 bg-primary/10 rounded-full mr-4 text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Paid Courses</p>
            <p className="text-2xl font-bold">{stats.perCourse.length}</p>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Chart */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-6">Revenue by Course</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))'}} />
              <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickFormatter={(value) => `$${value}`} />
              <RechartsTooltip 
                formatter={(value) => [`$${value}`, 'Revenue']}
                contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))'}}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Management */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-4 text-sm font-mono text-muted-foreground">#{tx.id}</td>
                  <td className="py-4">
                    <p className="font-medium text-sm">{tx.first_name} {tx.last_name}</p>
                    <p className="text-xs text-muted-foreground">{tx.email}</p>
                  </td>
                  <td className="py-4 text-sm">{tx.course_title}</td>
                  <td className="py-4 text-sm font-semibold">{formatPrice(tx.amount)}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tx.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    {tx.receipt_url ? (
                      <a href={tx.receipt_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-muted-foreground">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceDashboard;
