import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Order {
  _id: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
  };
  item: {
    title: string;
  };
  amount: number;
  totalPrice: number;
  status: string;
  receiptUrl?: string;
}

interface OrdersTableProps {
  orders: Order[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (orderId: string, status: string) => void;
  getStatusColor: (status: string) => string;
}

export function OrdersTable({ orders, searchQuery, onSearchChange, onStatusChange, getStatusColor }: OrdersTableProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">Orders Management</h2>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-border"
        />
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="glass-card p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-bold text-foreground">{order.orderId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.receiptUrl && (
                    <FileText className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground">{order.customerInfo.name}</span> · {order.customerInfo.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.item.title} × {order.amount}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-2xl font-bold text-primary">
                  {order.totalPrice.toFixed(2)}
                </span>
                <select
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  defaultValue={order.status}
                  onChange={(e) => onStatusChange(order._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}