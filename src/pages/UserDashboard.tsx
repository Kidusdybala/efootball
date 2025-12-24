import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  LogOut,
  ArrowLeft,
  Upload,
  Eye,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load orders from localStorage
    const storedOrders = localStorage.getItem(`user_orders_${user.id}`);
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders).map((order: Omit<Order, 'createdAt'> & { createdAt: string }) => ({
        ...order,
        createdAt: new Date(order.createdAt)
      }));
      setOrders(parsedOrders);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-secondary/20 text-secondary';
      case 'paid': return 'bg-accent/20 text-accent';
      case 'delivered': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleReceiptUpload = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingOrderId(orderId);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, receiptUrl: base64 } : order
      );
      setOrders(updatedOrders);
      localStorage.setItem(`user_orders_${user!.id}`, JSON.stringify(updatedOrders));
      setUploadingOrderId(null);
      toast({
        title: 'Receipt uploaded',
        description: 'Your receipt has been uploaded successfully',
      });
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold text-gradient truncate">AURASHOP</h1>
              <p className="text-xs text-muted-foreground">My Orders</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="whitespace-nowrap flex-shrink-0">
            <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground">My Orders</h2>
            <div className="text-sm text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button asChild>
                <Link to="/">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="glass-card p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono font-bold text-foreground text-sm">{order.orderId}</span>
                        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(order.status))}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-1">{order.itemTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Quantity: {order.quantity} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.receiptUrl && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Receipt uploaded</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <span className="font-display text-2xl font-bold text-primary">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                      {order.status === 'pending' && !order.receiptUrl && (
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleReceiptUpload(order.id, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingOrderId === order.id}
                          />
                          <Button variant="outline" size="sm" disabled={uploadingOrderId === order.id}>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingOrderId === order.id ? 'Uploading...' : 'Upload Receipt'}
                          </Button>
                        </div>
                      )}
                      {order.receiptUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Receipt
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}