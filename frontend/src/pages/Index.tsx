import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ItemCard } from '@/components/ItemCard';
import { TabType, CoinPackage, Account, Team, Listing } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/lib/utils';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('coins');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<(CoinPackage | Account | Team)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.pathname.includes('/accounts')) {
      setActiveTab('accounts');
    } else {
      setActiveTab('coins');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoggedIn && !isLoading) {
      navigate('/login');
    }
  }, [isLoggedIn, isLoading, navigate]);


  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings`);
        if (response.ok) {
          const data: Listing[] = await response.json();
          setListings(data.map((listing) => ({ ...listing, id: listing._id } as CoinPackage | Account | Team)));
        }
      } catch (error) {
        // No fallback - all data should be in MongoDB
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);


  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return listings
      .filter(item =>
        (activeTab === 'coins' ? item.type === 'coin' : item.type === 'account' || item.type === 'team') &&
        !item.title.includes('Japan') &&
        (item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query))
      )
      .sort((a, b) => {
        // Sort discounted items first
        if (a.discount && !b.discount) return -1;
        if (!a.discount && b.discount) return 1;
        // Then sort by price ascending
        return a.price - b.price;
      });
  }, [activeTab, searchQuery, listings]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="px-1 sm:px-4 pt-8 pb-6">
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-foreground capitalize">
            {t(`index.${activeTab}`)}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} {t('index.items')}
          </span>
        </div>

        {/* All Items Grid */}
        <div className="space-y-8">
          {/* Special Cons with Manager Section */}
          {activeTab === 'coins' && listings.some((item) => 'playerImage' in item && (item as any).playerImage) && (
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  <div>
                    <h3 className="font-display text-xl font-black text-foreground flex items-center gap-2 tracking-tight">
                      Special Cons with Manager
                      <span className="text-2xl">👔</span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      Exclusive Player Packs
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {listings.filter((item) => 'playerImage' in item && (item as any).playerImage).map((item, index) => (
                  <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemCard
                      item={item}
                      type={item.type}
                      onClick={() => navigate(`/order/${item.id}`)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'coins' && filteredItems.some(item => item.discount) && (
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                  <div>
                    <h3 className="font-display text-xl font-black text-foreground flex items-center gap-2 tracking-tight">
                      {t('index.discountedCoins', 'Discounted Coins')}
                      <span className="text-2xl">🔥</span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      {t('index.limitedTime', 'Limited Time Offers')}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                  <span className="text-xs font-bold text-red-600 capitalize">
                    {t('index.specialDeals', 'Special Deals')}
                  </span>
                </div>
              </div>
              <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredItems.filter(item => item.discount).map((item, index) => (
                  <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemCard
                      item={item}
                      type={item.type}
                      onClick={() => navigate(`/order/${item.id}`)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            {activeTab === 'coins' && filteredItems.some(item => item.discount) && (
              <div className="flex items-center gap-3 mb-4 mt-8">
                <div className="w-1.5 h-8 bg-muted rounded-full opacity-50" />
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 opacity-80">
                    {t('index.allCoins', 'Regular Packages')}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                    {t('index.standardPricing', 'Standard Pricing')}
                  </p>
                </div>
              </div>
            )}
            <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredItems
                .filter(item => activeTab === 'coins' ? (filteredItems.some(i => i.discount) ? !item.discount : true) : true)
                .map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ItemCard
                      item={item}
                      type={item.type}
                      onClick={() => navigate(`/order/${item.id}`)}
                    />
                  </div>
                ))}
            </div>
          </section>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('index.noItems')}</p>
          </div>
        )}

      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  );
};

export default Index;
