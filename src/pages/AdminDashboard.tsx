import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Coins, 
  UserCircle, 
  Users, 
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  LogOut,
  ArrowLeft,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { coinPackages, accounts, teams, sampleOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type AdminTab = 'dashboard' | 'coins' | 'accounts' | 'teams' | 'orders';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/admin');
  };

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coins' as AdminTab, label: 'Coins', icon: Coins },
    { id: 'accounts' as AdminTab, label: 'Accounts', icon: UserCircle },
    { id: 'teams' as AdminTab, label: 'Teams', icon: Users },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingCart },
  ];

  const stats = [
    { label: 'Total Coins Packages', value: coinPackages.length, color: 'text-secondary' },
    { label: 'Total Accounts', value: accounts.length, color: 'text-accent' },
    { label: 'Total Teams', value: teams.length, color: 'text-primary' },
    { label: 'Pending Orders', value: sampleOrders.filter(o => o.status === 'pending').length, color: 'text-destructive' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-secondary/20 text-secondary';
      case 'paid': return 'bg-accent/20 text-accent';
      case 'delivered': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
              <p className="text-xs text-muted-foreground">Admin Panel</p>
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
        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Dashboard</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card p-4">
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className={cn("font-display text-3xl font-bold", stat.color)}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="glass-card p-4 sm:p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full hidden md:table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Order ID</th>
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Customer</th>
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Item</th>
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Total</th>
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleOrders.map(order => (
                      <tr key={order.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-sm font-mono text-foreground">{order.orderId}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{order.customerName}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{order.itemTitle}</td>
                        <td className="py-3 px-2 text-sm font-bold text-primary">${order.totalPrice.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(order.status))}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-3 md:hidden">
                {sampleOrders.map(order => (
                  <div key={order.id} className="border border-border/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-foreground">{order.orderId}</span>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{order.customerName}</p>
                    <p className="text-xs text-foreground mb-2">{order.itemTitle}</p>
                    <p className="text-sm font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'coins' || activeTab === 'accounts' || activeTab === 'teams') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground capitalize">{activeTab}</h2>
              <Button variant="glow">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'coins' ? coinPackages : activeTab === 'accounts' ? accounts : teams)
                .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(item => (
                  <div key={item.id} className="glass-card p-4">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <p className="font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Orders Management</h2>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>

            <div className="space-y-4">
              {sampleOrders.map(order => (
                <div key={order.id} className="glass-card p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold text-foreground">{order.orderId}</span>
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground">{order.customerName}</span> · {order.customerEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.itemTitle} × {order.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display text-2xl font-bold text-primary">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                      <select 
                        className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                        defaultValue={order.status}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300",
                  activeTab === tab.id
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
