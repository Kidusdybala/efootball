import { useState, useEffect } from 'react';
import { Phone, Mail, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoinPackage, Account, Team, PaymentMethod } from '@/types';

interface OrderFormProps {
  item: CoinPackage | Account | Team;
  type: 'coin' | 'account' | 'team';
  formData: {
    name: string;
    phone: string;
    email: string;
    quantity: number;
    selectedBank: string;
  };
  onFormChange: (data: Partial<OrderFormProps['formData']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  totalPrice: number;
}

export function OrderForm({ item, type, formData, onFormChange, onSubmit, totalPrice }: OrderFormProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payment-methods');
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
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Full Name
        </Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => onFormChange({ name: e.target.value })}
          placeholder="Enter your full name"
          className="bg-muted border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => onFormChange({ phone: e.target.value })}
          placeholder="Enter your phone number"
          className="bg-muted border-border"
        />
      </div>

      {type !== 'account' && (
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => onFormChange({ email: e.target.value })}
            placeholder="Enter your email"
            className="bg-muted border-border"
          />
        </div>
      )}

      {type === 'account' && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Choose Bank
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => onFormChange({ selectedBank: method.id })}
                className={`flex flex-col items-center p-2 border rounded-lg transition-all duration-200 ${
                  formData.selectedBank === method.id
                    ? 'border-2 border-primary bg-green-50'
                    : 'border-border bg-white hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <img
                  src={method.image}
                  alt={method.name}
                  className="w-10 h-10 mb-1 object-contain"
                />
                <span className="text-sm font-medium text-gray-900 text-center">{method.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {type === 'coin' && (
        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={10}
            value={formData.quantity}
            onChange={(e) => onFormChange({ quantity: parseInt(e.target.value) || 1 })}
            className="bg-muted border-border"
          />
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Total Price</span>
          <span className="font-display text-2xl font-bold text-primary">
            {totalPrice.toFixed(2)}
          </span>
        </div>

        <Button type="submit" variant="glow" size="lg" className="w-full">
          Place Order
        </Button>
      </div>
    </form>
  );
}