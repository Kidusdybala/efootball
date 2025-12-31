import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Coins,
  UserCircle,
  Users,
  ShoppingCart
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AdminHeader, DashboardStats, ListingsGrid, OrdersTable, AddListingModal, AdminProfileModal } from '@/components/admin';

type AdminTab = 'dashboard' | 'coins' | 'accounts' | 'orders';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminData, setAdminData] = useState({ name: '', username: '' });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
    }

    // Load admin data from localStorage
    const storedAdmin = localStorage.getItem('admin_data');
    if (storedAdmin) {
      setAdminData(JSON.parse(storedAdmin));
    }
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;
    let tab: AdminTab = 'dashboard';
    if (path.endsWith('/coins')) tab = 'coins';
    else if (path.endsWith('/accounts')) tab = 'accounts';
    else if (path.endsWith('/orders')) tab = 'orders';
    setActiveTab(tab);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        const [listingsRes, ordersRes] = await Promise.all([
          fetch('http://localhost:5000/api/listings', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setListings(listingsData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const path = tab === 'dashboard' ? '/admin/dashboard' :
                 tab === 'coins' ? '/admin/dashboard/coins' :
                 tab === 'accounts' ? '/admin/dashboard/accounts' :
                 '/admin/dashboard/orders';
    navigate(path);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('admin_token');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/admin');
    setShowLogoutConfirm(false);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status } : order
        ));
        toast({
          title: 'Status updated',
          description: 'Order status has been updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update order status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleAddNew = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (data: FormData) => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        const addedListing = await response.json();
        setListings([...listings, addedListing]);
        toast({
          title: 'Added successfully',
          description: 'New listing has been added',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add listing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add listing',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
  };

  const handleEditSubmit = async (data: FormData) => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`http://localhost:5000/api/listings/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        const updatedListing = await response.json();
        setListings(listings.map(listing => listing._id === editingItem._id ? updatedListing : listing));
        toast({
          title: 'Updated successfully',
          description: 'Listing has been updated',
        });
        setEditingItem(null);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update listing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (item: any) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleProfileUpdate = async (data: { name: string; currentPassword: string; newPassword: string }) => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setAdminData(result.admin);
        localStorage.setItem('admin_data', JSON.stringify(result.admin));
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`http://localhost:5000/api/listings/${deletingItem._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setListings(listings.filter(listing => listing._id !== deletingItem._id));
        toast({
          title: 'Deleted successfully',
          description: 'Listing has been deleted',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete listing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    }
  };

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coins' as AdminTab, label: 'Coins', icon: Coins },
    { id: 'accounts' as AdminTab, label: 'Accounts', icon: Users },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingCart },
  ];

  const stats = [
    { label: 'Total Coins Packages', value: listings.filter(l => l.type === 'coin').length, color: 'text-secondary' },
    { label: 'Total Accounts', value: listings.filter(l => l.type === 'account').length, color: 'text-accent' },
    { label: 'Total Listings', value: listings.length, color: 'text-primary' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, color: 'text-destructive' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-secondary/20 text-secondary';
      case 'Paid': return 'bg-accent/20 text-accent';
      case 'Delivered': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AdminHeader onLogout={handleLogout} onProfileClick={handleProfileClick} />

      <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 pt-0 pb-3 sm:pb-4 lg:pb-6">
        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-3 mb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300",
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
          <div className="space-y-3 lg:space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">Dashboard</h2>
            
            <DashboardStats stats={stats} />

            <div className="glass-card p-3 sm:p-4">
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
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-sm font-mono text-foreground">{order.orderId}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{order.customerInfo.name}</td>
                        <td className="py-3 px-2 text-sm text-foreground">{order.item?.title || 'Unknown Item'}</td>
                        <td className="py-3 px-2 text-sm font-bold text-primary">{order.totalPrice.toFixed(2)}</td>
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
                {orders.slice(0, 5).map(order => (
                  <div key={order._id} className="border border-border/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-foreground">{order.orderId}</span>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{order.customerInfo.name}</p>
                    <p className="text-xs text-foreground mb-2">{order.item?.title || 'Unknown Item'}</p>
                    <p className="text-sm font-bold text-primary">{order.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'coins' || activeTab === 'accounts') && (
          <ListingsGrid
            listings={listings.filter(item => item.type === (activeTab === 'coins' ? 'coin' : 'account')).filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTable
            orders={orders}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
          />
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
                onClick={() => handleTabChange(tab.id)}
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

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddListingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubmit}
        type={activeTab === 'coins' ? 'coin' : 'account'}
      />

      <AddListingModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onAdd={handleEditSubmit}
        type={editingItem?.type === 'coin' ? 'coin' : 'account'}
        item={editingItem}
      />

      <AdminProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentName={adminData.name}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}
