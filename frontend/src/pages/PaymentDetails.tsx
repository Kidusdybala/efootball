import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentDetails as PaymentDetailsComponent } from '@/components/order';
import { PaymentMethod, Order } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

const PaymentDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payment methods
        const pmResponse = await fetch(`${API_BASE_URL}/api/payment-methods`);
        if (pmResponse.ok) {
          const pmData = await pmResponse.json();
          setPaymentMethods(pmData);
        }

        // Fetch order details
        const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </header>
      <main className="px-4 pt-8 pb-6 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Order Placed!</h3>
          <p className="text-muted-foreground">Your Order ID:</p>
          <p className="font-display text-2xl font-bold text-secondary">{order.orderId}</p>
        </div>

        <PaymentDetailsComponent
          orderId={order.orderId}
          totalPrice={order.totalPrice}
          onCopy={copyToClipboard}
          copied={copied}
          paymentMethods={paymentMethods}
        />

        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please transfer the exact amount and We will process your order once payment is confirmed.
          </p>

          <Button onClick={() => navigate('/payment')} variant="outline" size="lg" className="w-full">
            I have paid
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PaymentDetailsPage;