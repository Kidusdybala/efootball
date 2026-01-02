import { useState, useEffect } from 'react';
import { Phone, Mail, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoinPackage, Account, Team, PaymentMethod } from '@/types';
import { API_BASE_URL } from '@/lib/utils';
import team1 from '@/assets/teams/2abc9e5b3b48009af50a016530aa6af6.jpg';
import team2 from '@/assets/teams/352be9320c1d8682ce6b0da5aeb51aaa.jpg';
import team3 from '@/assets/teams/3d0fac9139511c599579d12daeffdf85.jpg';
import team4 from '@/assets/teams/4d16b11b664be199dc41acc9ee2d9c79.jpg';
import team5 from '@/assets/teams/83b2288ce46adf26ccded8a2677ce6d1.jpg';
import team6 from '@/assets/teams/e31b1b057ca3b49857a23114ac0e5e71.jpg';

interface OrderFormProps {
  item: CoinPackage | Account | Team;
  type: 'coin' | 'account' | 'team';
  formData: {
    name: string;
    phone: string;
    email: string;
    quantity: number;
    efootballEmail: string;
    efootballPassword: string;
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

  const teamImages = [team1, team2, team3, team4, team5, team6];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {type !== 'coin' && (
        <div className="mb-6">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
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

      <div className="space-y-2">
        <Label htmlFor="efootballEmail" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          eFootball Email
        </Label>
        <Input
          id="efootballEmail"
          type="email"
          required
          value={formData.efootballEmail}
          onChange={(e) => onFormChange({ efootballEmail: e.target.value })}
          placeholder="Enter your eFootball account email"
          className="bg-muted border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="efootballPassword" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          eFootball Password
        </Label>
        <Input
          id="efootballPassword"
          type="password"
          required
          value={formData.efootballPassword}
          onChange={(e) => onFormChange({ efootballPassword: e.target.value })}
          placeholder="Enter your eFootball password"
          className="bg-muted border-border"
        />
      </div>

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