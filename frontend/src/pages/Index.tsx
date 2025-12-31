import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ItemCard } from '@/components/ItemCard';
import { TabType, CoinPackage, Account, Team, Listing } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

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
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('https://efootball-3.onrender.com/api/listings');
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
        <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item, index) => (
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
