import { useState } from 'react';
import { X, Phone, Mail, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoinPackage, Account, Team, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OrderModalProps {
  item: CoinPackage | Account | Team;
  type: 'coin' | 'account' | 'team';
  onClose: () => void;
}

export function OrderModal({ item, type, onClose }: OrderModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    quantity: 1,
    notes: '',
  });

  const totalPrice = item.price * formData.quantity;

  const generateOrderId = () => {
    return `AUR-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    setStep('payment');
    
    // Here you would typically send to backend/Telegram
    toast({
      title: "Order Created!",
      description: `Your order ID is ${newOrderId}`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
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

        {step === 'form' ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-display font-bold text-foreground">{item.title}</h3>
                <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
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
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="bg-muted border-border"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Total Price</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                
                <Button type="submit" variant="glow" size="lg" className="w-full">
                  Place Order
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Order Placed!</h3>
              <p className="text-muted-foreground">Your Order ID:</p>
              <p className="font-display text-2xl font-bold text-secondary">{orderId}</p>
            </div>

            <div className="glass-card p-4 mb-6 space-y-3">
              <h4 className="font-display font-semibold text-foreground mb-3">Payment Details</h4>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="text-foreground font-medium">{bankDetails.bankName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name</span>
                <span className="text-foreground font-medium">{bankDetails.accountName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold">{bankDetails.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                    className="p-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Amount to Pay</span>
                <span className="font-display text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center mb-4">
              Please transfer the exact amount and include your Order ID in the payment reference.
              We will process your order once payment is confirmed.
            </p>

            <Button onClick={onClose} variant="outline" size="lg" className="w-full">
              Done
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
