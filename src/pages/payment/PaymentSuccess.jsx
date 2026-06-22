import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!sessionId) {
      navigate('/courses');
    }
    // We don't verify here, we rely on the webhook to enroll the student securely.
    // The user can go to their dashboard to see the course.
  }, [sessionId, navigate]);

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="bg-card text-card-foreground shadow-lg rounded-xl p-8 max-w-md text-center border border-border">
        <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your payment is being processed and you will be enrolled automatically. 
          Please check your dashboard or "My Courses" shortly.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link to="/my-courses" className="btn btn-primary w-full">
            Go to My Courses
          </Link>
          <Link to="/student/purchases" className="text-primary hover:underline">
            View Purchase History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
