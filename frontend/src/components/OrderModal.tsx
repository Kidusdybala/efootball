import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoinPackage, Account, Team, Order, PaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OrderForm, PaymentDetails, TeamGallery } from '@/components/order';
import { API_BASE_URL } from '@/lib/utils';
import team1 from '@/assets/teams/2abc9e5b3b48009af50a016530aa6af6.jpg';
import team2 from '@/assets/teams/352be9320c1d8682ce6b0da5aeb51aaa.jpg';
import team3 from '@/assets/teams/3d0fac9139511c599579d12daeffdf85.jpg';
import team4 from '@/assets/teams/4d16b11b664be199dc41acc9ee2d9c79.jpg';
import team5 from '@/assets/teams/83b2288ce46adf26ccded8a2677ce6d1.jpg';
import team6 from '@/assets/teams/e31b1b057ca3b49857a23114ac0e5e71.jpg';

interface OrderModalProps {
  item: CoinPackage | Account | Team;
  type: 'coin' | 'account' | 'team';
  onClose: () => void;
}

export function OrderModal({ item, type, onClose }: OrderModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<'gallery' | 'form' | 'payment'>('form');
  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/payment-methods`);
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    fetchPaymentMethods();
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    quantity: 1,
    notes: '',
  });

  const totalPrice = item.price * formData.quantity;

  const teamImages = [team1, team2, team3, team4, team5, team6];


  const generateOrderId = () => {
    return `AUR-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newOrderId = generateOrderId();

    try {
      const orderData = {
        orderId: newOrderId,
        customerInfo: {
          name: formData.name,
          email: formData.email || '',
          phone: formData.phone,
        },
        item: item.id, // This should be the MongoDB _id
        amount: formData.quantity,
        totalPrice: totalPrice,
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderId(newOrderId);
        setStep('payment');
        toast({
          title: t('toast.orderCreated'),
          description: `${t('toast.orderId')} ${newOrderId}`,
        });
      } else {
        toast({
          title: t('toast.error'),
          description: "Failed to create order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: t('toast.copied'),
      description: t('toast.accountNumberCopied'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-card rounded-t-3xl md:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'gallery' ? (
          <TeamGallery images={teamImages} onProceed={() => setStep('form')} />
        ) : step === 'form' ? (
          <>
            {type === 'coin' && (
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-display font-bold text-foreground">{item.title}</h3>
                  <p className="text-primary font-bold">{item.price.toFixed(2)}</p>
                </div>
              </div>
            )}

            <OrderForm
              item={item}
              type={type}
              formData={formData}
              onFormChange={(data) => setFormData({ ...formData, ...data })}
              onSubmit={handleSubmit}
              totalPrice={totalPrice}
            />
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{t('orderModal.orderPlaced')}</h3>
              <p className="text-muted-foreground">{t('orderModal.yourOrderId')}</p>
              <p className="font-display text-2xl font-bold text-secondary">{orderId}</p>
            </div>

            <PaymentDetails
              orderId={orderId}
              totalPrice={totalPrice}
              onCopy={copyToClipboard}
              copied={copied}
              paymentMethods={paymentMethods}
            />

            <p className="text-sm text-muted-foreground text-center mb-4">
              {t('orderModal.paymentInstruction')}
            </p>

            <Button onClick={() => { onClose(); navigate('/payment'); }} variant="outline" size="lg" className="w-full">
              {t('orderModal.iHavePaid')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
