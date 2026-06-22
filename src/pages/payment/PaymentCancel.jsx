import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="bg-card text-card-foreground shadow-lg rounded-xl p-8 max-w-md text-center border border-border">
        <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled and you have not been charged. If you experienced an issue, you can try again later.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link to="/courses" className="btn btn-primary w-full">
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
