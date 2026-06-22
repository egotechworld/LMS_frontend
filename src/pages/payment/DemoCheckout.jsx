import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { paymentService } from '../../services/paymentService';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../../lib/utils';
import './Payment.css';

const DemoCheckout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fake card details state
  const [cardName, setCardName] = useState('John Doe');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/25');
  const [cvc, setCvc] = useState('123');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseService.getCourseById(courseId);
        setCourse(response.data);
      } catch (error) {
        console.error('Failed to load course details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      await paymentService.demoCheckout(courseId);
      navigate('/payment/success');
    } catch (error) {
      alert(error.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading checkout...</div>;
  if (!course) return <div className="p-8 text-center text-white">Course not found</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto p-6 text-white min-h-[80vh] items-start mt-8">
      
      {/* Checkout Form */}
      <div className="flex-1 bg-[hsl(224,44%,14%)] rounded-xl p-8 border border-white/10 w-full">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="text-blue-400 w-8 h-8" />
          <h2 className="text-2xl font-bold">Secure Checkout</h2>
        </div>
        
        <form onSubmit={handlePayment} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-sm text-white/70 mb-1">Name on Card</label>
            <input 
              type="text" 
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="bg-[hsl(224,44%,10%)] border border-white/20 rounded p-3 text-white focus:border-blue-500 outline-none"
              required 
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-white/70 mb-1">Card Number</label>
            <input 
              type="text" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="bg-[hsl(224,44%,10%)] border border-white/20 rounded p-3 text-white focus:border-blue-500 outline-none tracking-widest font-mono"
              required 
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-sm text-white/70 mb-1">Expiry</label>
              <input 
                type="text" 
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="bg-[hsl(224,44%,10%)] border border-white/20 rounded p-3 text-white focus:border-blue-500 outline-none"
                required 
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm text-white/70 mb-1">CVC</label>
              <input 
                type="text" 
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                className="bg-[hsl(224,44%,10%)] border border-white/20 rounded p-3 text-white focus:border-blue-500 outline-none"
                required 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Payments are secure and encrypted (Demo Mode)</span>
          </div>

          <button 
            type="submit" 
            disabled={processing}
            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {processing ? 'Processing...' : `Pay $${course.price}`}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="w-full md:w-80 bg-[hsl(224,44%,10%)] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Order Summary</h3>
        <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-32 object-cover rounded-md mb-4 border border-white/10" />
        <h4 className="font-semibold mb-1">{course.title}</h4>
        <p className="text-xs text-white/50 mb-6 truncate">{course.description}</p>
        
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10 text-sm">
          <span className="text-white/70">Subtotal</span>
          <span>${course.price}</span>
        </div>
        <div className="flex justify-between items-center font-bold text-lg mt-4">
          <span>Total</span>
          <span>${course.price}</span>
        </div>
      </div>

    </div>
  );
};

export default DemoCheckout;
