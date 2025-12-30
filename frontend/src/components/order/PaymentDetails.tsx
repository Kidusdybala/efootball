import { Check, Copy } from 'lucide-react';
import { PaymentMethod } from '@/types';

interface PaymentDetailsProps {
  orderId: string;
  totalPrice: number;
  onCopy: (text: string) => void;
  copied: boolean;
  paymentMethods: PaymentMethod[];
}

export function PaymentDetails({ orderId, totalPrice, onCopy, copied, paymentMethods }: PaymentDetailsProps) {
  return (
    <div className="glass-card p-4 mb-6 space-y-4">
      <h4 className="font-display font-semibold text-foreground mb-4">Payment Details</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <div key={method._id || method.id} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={method.image}
                alt={method.name}
                className="w-8 h-8 object-contain"
              />
              <span className="font-medium text-foreground">{method.name}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Name</span>
              <span className="text-foreground">{method.accountName}</span>
            </div>

            {method.accountNumber && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-mono">{method.accountNumber}</span>
                  <button
                    onClick={() => onCopy(method.accountNumber!)}
                    className="p-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <span className="text-muted-foreground">Amount to Pay</span>
        <span className="font-display text-xl font-bold text-primary">{totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}