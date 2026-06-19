import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Coins,
  UserCircle,
  Users,
  ShoppingCart,
  Trophy,
  Award,
  Plus,
  Edit,
  Trash2,
  Search,
  Gift,
  Send,
  MessageSquare
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn, API_BASE_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AdminHeader, DashboardStats, ListingsGrid, OrdersTable, AddListingModal, AdminProfileModal } from '@/components/admin';

type AdminTab = 'dashboard' | 'coins' | 'accounts' | 'orders' | 'leaderboard' | 'milestones';

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
  const [listingMap, setListingMap] = useState(new Map());

  // Points & Rewards System Admin State
  const [users, setUsers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  
  // Manual Reward State
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardingUser, setRewardingUser] = useState<any>(null);
  const [rewardCoins, setRewardCoins] = useState('');
  const [rewardNote, setRewardNote] = useState('');
  const [submittingReward, setSubmittingReward] = useState(false);

  // Milestone CRUD State
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestonePoints, setMilestonePoints] = useState('');
  const [milestoneCoins, setMilestoneCoins] = useState('');
  const [milestoneLabel, setMilestoneLabel] = useState('');
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // User search/sorting filters
  const [userSearch, setUserSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState('pointsBalance');
  const [userSortOrder, setUserSortOrder] = useState('desc');

  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
    }
    setIsAuthChecking(false);

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
    else if (path.endsWith('/leaderboard')) tab = 'leaderboard';
    else if (path.endsWith('/milestones')) tab = 'milestones';
    setActiveTab(tab);
  }, [location.pathname]);

  // Main data fetch
  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const [listingsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/listings`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData);
        const map = new Map(listingsData.map(l => [l._id, l.title]));
        setListingMap(map);
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

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch users for leaderboard
  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/points/users?search=${userSearch}&sortBy=${userSortBy}&sortOrder=${userSortOrder}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch milestones
  const fetchMilestones = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoadingMilestones(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/milestones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoadingMilestones(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchUsers();
    } else if (activeTab === 'milestones') {
      fetchMilestones();
    }
  }, [activeTab, userSearch, userSortBy, userSortOrder]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const path = tab === 'dashboard' ? '/admin/dashboard' : `/admin/dashboard/${tab}`;
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
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        const addedListing = await response.json();
        setListings([...listings, addedListing]);
        setListingMap(new Map([...listingMap, [addedListing._id, addedListing.title]]));
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
      const response = await fetch(`${API_BASE_URL}/api/listings/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        const updatedListing = await response.json();
        setListings(listings.map(listing => listing._id === editingItem._id ? updatedListing : listing));
        setListingMap(new Map([...listingMap, [updatedListing._id, updatedListing.title]]));
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
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/profile`, {
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
      const response = await fetch(`${API_BASE_URL}/api/listings/${deletingItem._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setListings(listings.filter(listing => listing._id !== deletingItem._id));
        const newMap = new Map(listingMap);
        newMap.delete(deletingItem._id);
        setListingMap(newMap);
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

  // Submit manual coin reward
  const handleRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardingUser || !rewardCoins) return;

    const token = localStorage.getItem('admin_token');
    setSubmittingReward(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/points/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: rewardingUser._id,
          coins: Number(rewardCoins),
          note: rewardNote
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Successfully rewarded ${rewardCoins} free coins to ${rewardingUser.name}`
        });
        setShowRewardModal(false);
        setRewardCoins('');
        setRewardNote('');
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: 'Failed to Reward',
          description: error.message || 'Error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting reward:', error);
    } finally {
      setSubmittingReward(false);
    }
  };

  // Submit milestone CREATE or EDIT
  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    setSubmittingMilestone(true);

    const bodyData = {
      pointsRequired: Number(milestonePoints),
      rewardCoins: Number(milestoneCoins),
      label: milestoneLabel
    };

    try {
      let response;
      if (editingMilestone) {
        // Edit mode
        response = await fetch(`${API_BASE_URL}/api/points/milestones/${editingMilestone._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      } else {
        // Create mode
        response = await fetch(`${API_BASE_URL}/api/points/milestones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      }

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingMilestone ? 'Milestone updated successfully' : 'Milestone created successfully'
        });
        setShowMilestoneModal(false);
        setEditingMilestone(null);
        setMilestonePoints('');
        setMilestoneCoins('');
        setMilestoneLabel('');
        fetchMilestones();
      } else {
        const error = await response.json();
        toast({
          title: 'Failed',
          description: error.message || 'Error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting milestone:', error);
    } finally {
      setSubmittingMilestone(false);
    }
  };

  // Delete Milestone
  const handleDeleteMilestone = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/points/milestones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast({
          title: 'Deleted',
          description: 'Milestone deleted successfully'
        });
        fetchMilestones();
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const openEditMilestone = (m: any) => {
    setEditingMilestone(m);
    setMilestonePoints(m.pointsRequired.toString());
    setMilestoneCoins(m.rewardCoins.toString());
    setMilestoneLabel(m.label);
    setShowMilestoneModal(true);
  };

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coins' as AdminTab, label: 'Coins', icon: Coins },
    { id: 'accounts' as AdminTab, label: 'Accounts', icon: Users },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingCart },
    { id: 'leaderboard' as AdminTab, label: 'Leaderboard', icon: Trophy },
    { id: 'milestones' as AdminTab, label: 'Milestones', icon: Award },
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

  if (isAuthChecking) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background text-foreground">
      <AdminHeader onLogout={handleLogout} onProfileClick={handleProfileClick} />

      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-0 pb-3 sm:pb-4 lg:pb-6">
        {/* Desktop Tabs */}
        <div className="hidden md:flex flex-wrap gap-2.5 mb-5 border-b border-border/50 pb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Dashboard Overview</h2>
                <DashboardStats stats={stats} />

                <div className="glass-card p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-lg font-bold text-foreground">Recent Orders</h3>
                    <Button variant="ghost" size="sm" onClick={() => handleTabChange('orders')}>View All Orders</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full hidden md:table">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="text-left py-3 px-2 font-medium">Order ID</th>
                          <th className="text-left py-3 px-2 font-medium">Customer</th>
                          <th className="text-left py-3 px-2 font-medium">Item</th>
                          <th className="text-left py-3 px-2 font-medium">Total</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order._id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-2 text-sm font-mono font-semibold text-foreground">{order.orderId}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{order.customerInfo?.name || 'N/A'}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{listingMap.get(order.item) || 'Unknown Item'}</td>
                            <td className="py-3 px-2 text-sm font-bold text-primary">{order.totalPrice.toFixed(2)}</td>
                            <td className="py-3 px-2">
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", getStatusColor(order.status))}>
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
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", getStatusColor(order.status))}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{order.customerInfo?.name || 'N/A'}</p>
                        <p className="text-xs text-foreground mb-2">{listingMap.get(order.item) || 'Unknown Item'}</p>
                        <p className="text-sm font-bold text-primary">{order.totalPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Coins / Accounts Grid Tab */}
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

            {/* Orders Management Tab */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <OrdersTable
                  orders={orders.filter(order =>
                    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.customerInfo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.customerInfo?.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onStatusChange={handleStatusChange}
                  getStatusColor={getStatusColor}
                  listingMap={listingMap}
                />
              </div>
            )}

            {/* Points Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold">Users Leaderboard</h2>
                    <p className="text-sm text-muted-foreground">Manage user points balance, search accounts, and reward users.</p>
                  </div>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 bg-muted border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={userSortBy}
                      onChange={(e) => setUserSortBy(e.target.value)}
                      className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                    >
                      <option value="pointsBalance">Sort by Points</option>
                      <option value="totalSpent">Sort by Total Spent</option>
                      <option value="totalOrders">Sort by Total Orders</option>
                    </select>
                    <select
                      value={userSortOrder}
                      onChange={(e) => setUserSortOrder(e.target.value)}
                      className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>

                {/* Users List Table */}
                {loadingUsers ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="py-3 px-4 text-left font-medium">Rank</th>
                            <th className="py-3 px-4 text-left font-medium">User Details</th>
                            <th className="py-3 px-4 text-center font-medium">Telegram ID</th>
                            <th className="py-3 px-4 text-center font-medium">Orders</th>
                            <th className="py-3 px-4 text-right font-medium">Total Spent</th>
                            <th className="py-3 px-4 text-right font-medium">Points</th>
                            <th className="py-3 px-4 text-center font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                No users found matching search criteria.
                              </td>
                            </tr>
                          ) : (
                            users.map((u, index) => (
                              <tr key={u._id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                                <td className="py-3 px-4 text-sm font-bold">
                                  {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-foreground">{u.name}</div>
                                  <div className="text-xs text-muted-foreground">{u.email}</div>
                                </td>
                                <td className="py-3 px-4 text-center text-sm font-mono">
                                  {u.telegramId ? (
                                    <span className="text-green-500 font-semibold text-xs bg-green-500/10 px-2 py-0.5 rounded-full">
                                      Active ({u.telegramId})
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">Not Linked</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center text-sm font-medium">{u.totalOrders}</td>
                                <td className="py-3 px-4 text-right text-sm font-bold text-primary">
                                  {u.totalSpent.toFixed(2)} ETB
                                </td>
                                <td className="py-3 px-4 text-right text-sm font-extrabold text-foreground">
                                  {u.pointsBalance} pts
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setRewardingUser(u);
                                      setShowRewardModal(true);
                                    }}
                                    className="h-8 gap-1 px-3 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-accent-foreground"
                                  >
                                    <Gift className="w-3.5 h-3.5" />
                                    Reward
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Milestone Settings Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold">Milestones Configuration</h2>
                    <p className="text-sm text-muted-foreground">Define and adjust milestone point thresholds and coin rewards.</p>
                  </div>
                  <Button onClick={() => {
                    setEditingMilestone(null);
                    setMilestonePoints('');
                    setMilestoneCoins('');
                    setMilestoneLabel('');
                    setShowMilestoneModal(true);
                  }} className="gap-1.5 shadow-sm shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    New Milestone
                  </Button>
                </div>

                {loadingMilestones ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {milestones.length === 0 ? (
                      <div className="col-span-full text-center py-12 glass-card text-sm text-muted-foreground">
                        No milestones configured yet. Click "New Milestone" to add one.
                      </div>
                    ) : (
                      milestones.map((m) => (
                        <div key={m._id} className="glass-card p-5 border border-border/40 hover:border-primary/20 transition-all duration-300 rounded-xl relative overflow-hidden">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                {m.pointsRequired} pts required
                              </span>
                              <h4 className="font-display text-lg font-bold text-foreground mt-2">{m.label}</h4>
                              <div className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-muted-foreground bg-muted w-fit px-2.5 py-1 rounded-md">
                                <Coins className="w-4 h-4 text-accent" />
                                <span>Gives <strong className="text-foreground">{m.rewardCoins}</strong> free coins</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditMilestone(m)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteMilestone(m._id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 md:hidden">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-300",
                  activeTab === tab.id
                    ? "text-primary bg-primary/10 font-bold"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Manual Coin Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Reward Free Coins</DialogTitle>
          </DialogHeader>
          {rewardingUser && (
            <form onSubmit={handleRewardSubmit} className="space-y-4 py-2">
              <div>
                <Label className="text-sm font-medium">Customer</Label>
                <div className="mt-1 text-sm bg-muted p-2.5 rounded-lg border border-border font-medium">
                  {rewardingUser.name} ({rewardingUser.email})
                </div>
              </div>

              <div>
                <Label htmlFor="rewardCoins" className="text-sm font-medium">Free Coins Amount</Label>
                <Input
                  id="rewardCoins"
                  type="number"
                  placeholder="e.g. 100, 500"
                  value={rewardCoins}
                  onChange={(e) => setRewardCoins(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rewardNote" className="text-sm font-medium">Note / Reason (Sent to user)</Label>
                <Textarea
                  id="rewardNote"
                  placeholder="e.g. Loyalty Reward, Milestone bonus"
                  value={rewardNote}
                  onChange={(e) => setRewardNote(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setShowRewardModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReward} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                  {submittingReward ? 'Sending...' : 'Issue Reward'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Milestone Create/Edit Modal */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
              {editingMilestone ? 'Edit Milestone' : 'Create Milestone'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMilestoneSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="milestoneLabel" className="text-sm font-medium">Milestone Label / Description</Label>
              <Input
                id="milestoneLabel"
                type="text"
                placeholder="e.g. 500 Points Milestone"
                value={milestoneLabel}
                onChange={(e) => setMilestoneLabel(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="milestonePoints" className="text-sm font-medium">Points Required</Label>
                <Input
                  id="milestonePoints"
                  type="number"
                  placeholder="e.g. 500"
                  value={milestonePoints}
                  onChange={(e) => setMilestonePoints(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="milestoneCoins" className="text-sm font-medium">Coins Reward</Label>
                <Input
                  id="milestoneCoins"
                  type="number"
                  placeholder="e.g. 700"
                  value={milestoneCoins}
                  onChange={(e) => setMilestoneCoins(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => {
                setShowMilestoneModal(false);
                setEditingMilestone(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingMilestone}>
                {submittingMilestone ? 'Saving...' : 'Save Milestone'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialogs for standard confirms */}
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
