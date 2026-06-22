import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { ExternalLink, ReceiptText } from 'lucide-react';

const StudentPurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await paymentService.getPurchaseHistory();
      setPurchases(response.data);
    } catch (error) {
      console.error('Failed to fetch purchase history', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(priceInCents / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <div className="p-8 text-center">Loading purchase history...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ReceiptText className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Purchase History</h1>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border text-center">
          <p className="text-muted-foreground">You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground border-b border-border">
                  <th className="p-4 font-semibold">Course</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-3">
                        {purchase.thumbnail && (
                          <img src={purchase.thumbnail} alt={purchase.course_title} className="w-12 h-8 object-cover rounded" />
                        )}
                        {purchase.course_title}
                      </div>
                    </td>
                    <td className="p-4">{formatDate(purchase.paid_at || purchase.created_at)}</td>
                    <td className="p-4 font-medium text-foreground">
                      {formatPrice(purchase.amount, purchase.currency)}
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full dark:bg-green-900/30 dark:text-green-400">
                        {purchase.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {purchase.receipt_url ? (
                        <a 
                          href={purchase.receipt_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPurchaseHistory;
