import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  LogOut,
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Star,
  Trophy,
  Gift,
  Award,
  Calendar,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, API_BASE_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Order, PointTransaction, RewardMilestone, AdminReward } from '@/types';

interface PointsDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    pointsBalance: number;
    totalOrders: number;
    totalSpent: number;
    telegramId?: string;
  };
  rank: number;
  transactions: PointTransaction[];
  adminRewards: AdminReward[];
  milestones: RewardMilestone[];
  nextMilestone: {
    milestone: RewardMilestone;
    pointsNeeded: number;
  } | null;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isLoggedIn, isLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'rewards'>('orders');
  const [pointsData, setPointsData] = useState<PointsDashboardData | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, isLoading, navigate]);

  // Fetch orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.email}`);
        if (response.ok) {
          const data = await response.json();
          const formattedOrders = data.map((order: any) => ({
            id: order._id,
            orderId: order.orderId,
            customerInfo: order.customerInfo,
            item: order.item._id,
            itemTitle: order.item.title,
            amount: order.amount,
            quantity: order.amount,
            totalPrice: order.totalPrice,
            status: order.status || 'paid',
            createdAt: new Date(order.createdAt),
            receiptUrl: order.receiptUrl ? 'uploaded' : undefined,
          }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [user]);

  // Fetch points & rewards data
  useEffect(() => {
    if (!user || activeTab !== 'rewards') return;

    const fetchPointsData = async () => {
      setLoadingPoints(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/points/user/${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setPointsData(data);
        }
      } catch (error) {
        console.error('Error fetching points data:', error);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchPointsData();
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    navigate('/dashboard');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-secondary/20 text-secondary';
      case 'paid': return 'bg-accent/20 text-accent';
      case 'delivered': return 'bg-primary/20 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/dashboard" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold text-gradient truncate">AURA SHOP</h1>
              <p className="text-xs text-muted-foreground">User Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border/50 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border-b-2 font-display font-medium text-sm transition-all duration-300",
              activeTab === 'orders'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border-b-2 font-display font-medium text-sm transition-all duration-300",
              activeTab === 'rewards'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Award className="w-4 h-4" />
            Aura Rewards
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Order History</h2>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 glass-card p-6 rounded-2xl border border-border/50">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                <Button asChild>
                  <Link to="/dashboard">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="glass-card p-5 border border-border/40 hover:border-primary/30 transition-all duration-300 rounded-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono font-bold text-foreground text-sm bg-muted px-2.5 py-1 rounded-md">{order.orderId}</span>
                          <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", getStatusColor(order.status))}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </div>
                        <h3 className="font-display font-semibold text-foreground text-lg mb-1">{order.itemTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Quantity: {order.quantity} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.receiptUrl && (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Receipt uploaded and verified</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className="font-display text-2xl font-bold text-primary">
                          {order.totalPrice.toFixed(2)} ETB
                        </span>
                        {order.receiptUrl && (
                          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
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
        )}

        {/* Tab 2: Rewards */}
        {activeTab === 'rewards' && (
          <div className="space-y-6 animate-fade-in">
            {loadingPoints && !pointsData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground text-sm">Loading rewards program...</p>
              </div>
            ) : pointsData ? (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-5 border border-border/40 relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                    <Star className="absolute right-4 top-4 w-12 h-12 text-primary/10" />
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Aura Points</span>
                    <h3 className="font-display text-3xl font-extrabold text-primary mt-2">
                      {pointsData.user.pointsBalance} <span className="text-lg font-normal text-muted-foreground">pts</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">Earned from purchases</p>
                  </div>

                  <div className="glass-card p-5 border border-border/40 relative overflow-hidden rounded-xl bg-gradient-to-br from-accent/10 via-transparent to-transparent">
                    <Trophy className="absolute right-4 top-4 w-12 h-12 text-accent/10" />
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Leaderboard Rank</span>
                    <h3 className="font-display text-3xl font-extrabold text-accent mt-2">
                      #{pointsData.rank}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">Out of all registered users</p>
                  </div>

                  <div className="glass-card p-5 border border-border/40 relative overflow-hidden rounded-xl">
                    <Gift className="absolute right-4 top-4 w-12 h-12 text-secondary/10" />
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Lifetime Stats</span>
                    <h3 className="font-display text-xl font-bold text-foreground mt-2">
                      {pointsData.user.totalSpent.toFixed(0)} ETB
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Spent over {pointsData.user.totalOrders} order{pointsData.user.totalOrders !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Progress Bar / Milestone */}
                <div className="glass-card p-6 border border-border/40 rounded-xl">
                  {pointsData.nextMilestone ? (
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                        <div>
                          <h4 className="font-display font-bold text-foreground text-lg">Next Reward Milestone</h4>
                          <p className="text-xs text-muted-foreground">
                            {pointsData.nextMilestone.pointsNeeded} points away from <strong>{pointsData.nextMilestone.milestone.label}</strong>
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/20 text-primary rounded-full uppercase tracking-wider">
                          +{pointsData.nextMilestone.milestone.rewardCoins} Free Coins
                        </span>
                      </div>
                      
                      {/* Custom Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-4">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(
                              100,
                              (pointsData.user.pointsBalance / pointsData.nextMilestone.milestone.pointsRequired) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {pointsData.user.pointsBalance} pts</span>
                        <span>Milestone: {pointsData.nextMilestone.milestone.pointsRequired} pts</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Award className="w-12 h-12 text-primary mx-auto mb-2 animate-bounce" />
                      <h4 className="font-display font-bold text-foreground text-lg">🏆 VIP Rank Active!</h4>
                      <p className="text-sm text-muted-foreground">
                        You have unlocked all available milestones. You are a VIP client!
                      </p>
                    </div>
                  )}
                </div>

                {/* Telegram Bot Link Banner */}
                {!pointsData.user.telegramId && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Send className="w-5 h-5 text-primary mt-1 sm:mt-0 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Get points notifications on Telegram</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Link your account to our Telegram Bot to check your points balance anytime.
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto text-left">
                      <span className="text-xs font-medium text-muted-foreground block sm:inline mr-2">
                        To link, open bot and send:
                      </span>
                      <code className="text-xs bg-muted px-2 py-1 rounded border border-border font-mono text-primary font-bold">
                        {pointsData.user.email}
                      </code>
                    </div>
                  </div>
                )}

                {/* Reward Milestones List */}
                <div className="glass-card p-5 border border-border/40 rounded-xl">
                  <h4 className="font-display font-bold text-foreground mb-4">Aura Milestone Progression</h4>
                  <div className="relative border-l border-border/60 ml-4 pl-6 space-y-6">
                    {pointsData.milestones.map((m) => {
                      const isUnlocked = pointsData.user.pointsBalance >= m.pointsRequired;
                      return (
                        <div key={m._id} className="relative">
                          {/* Indicator Dot */}
                          <div
                            className={cn(
                              "absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                              isUnlocked
                                ? "bg-primary border-primary scale-110 shadow-sm shadow-primary"
                                : "bg-background border-border"
                            )}
                          >
                            {isUnlocked && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h5 className={cn("text-sm font-bold", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                                {m.label}
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                Requires {m.pointsRequired} points
                              </p>
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold px-2.5 py-1 rounded-md max-w-fit",
                                isUnlocked
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-muted text-muted-foreground border border-border"
                              )}
                            >
                              Gift: {m.rewardCoins} Free Coins
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Combined Activity History */}
                <div className="glass-card p-5 border border-border/40 rounded-xl">
                  <h4 className="font-display font-bold text-foreground mb-4">Rewards Activity Log</h4>
                  
                  {pointsData.transactions.length === 0 && pointsData.adminRewards.length === 0 ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">
                      No points transactions or coin rewards on record yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {/* Merge and Sort activity by date */}
                      {[
                        ...pointsData.transactions.map(t => ({
                          id: t._id,
                          type: 'points',
                          value: `+${t.pointsEarned} pts`,
                          reason: t.reason,
                          date: new Date(t.createdAt)
                        })),
                        ...pointsData.adminRewards.map(r => ({
                          id: r._id,
                          type: 'coins',
                          value: `+${r.coinsRewarded} coins`,
                          reason: `Manually rewarded by admin${r.note ? `: "${r.note}"` : ''}`,
                          date: new Date(r.createdAt)
                        }))
                      ]
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .map((act) => (
                          <div key={act.id} className="flex justify-between items-start gap-4 py-3 border-b border-border/40 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{act.reason}</p>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{act.date.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-sm font-bold whitespace-nowrap",
                                act.type === 'points' ? "text-primary" : "text-accent"
                              )}
                            >
                              {act.value}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 glass-card border border-border/50 p-6 rounded-2xl">
                <p className="text-muted-foreground text-sm">Failed to load rewards program details. Please refresh the page.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}