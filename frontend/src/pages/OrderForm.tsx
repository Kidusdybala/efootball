import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderForm as OrderFormComponent, TeamGallery } from '@/components/order';
import { CoinPackage, Account, Team, Listing } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderFormPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CoinPackage | Account | Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`https://efootball-3.onrender.com/api/listings/${itemId}`);
        if (response.ok) {
          const data: Listing = await response.json();
          setItem({ ...data, id: data._id } as CoinPackage | Account | Team);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    quantity: 1,
    selectedBank: '',
    notes: '',
  });

  const totalPrice = item ? item.price * formData.quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (item.type === 'account' && !formData.selectedBank) {
      alert("Please select a bank");
      return;
    }

    const orderId = `AUR-${Date.now().toString(36).toUpperCase()}`;

    try {
      const orderData = {
        orderId,
        customerInfo: {
          name: formData.name,
          email: formData.email || '',
          phone: formData.phone,
        },
        item: item.id,
        amount: formData.quantity,
        totalPrice,
      };

      const response = await fetch('https://efootball-3.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        localStorage.setItem('current_order_id', orderId);
        navigate(`/order/${orderId}/payment`);
      } else {
        alert("Failed to create order");
      }
    } catch (error) {
      alert("Failed to create order");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </header>
      <main className="px-4 pt-8 pb-6 max-w-md mx-auto">
        {item.type === 'account' && (
          <TeamGallery images={item.images} showProceedButton={false} title="Account Gallery" />
        )}

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

        <OrderFormComponent
          item={item}
          type={item.type}
          formData={formData}
          onFormChange={(data) => setFormData({ ...formData, ...data })}
          onSubmit={handleSubmit}
          totalPrice={totalPrice}
        />
      </main>
    </div>
  );
};

export default OrderFormPage;