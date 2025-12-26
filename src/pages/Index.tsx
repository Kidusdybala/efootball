import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ItemCard } from '@/components/ItemCard';
import { OrderModal } from '@/components/OrderModal';
import { coinPackages, Accounts } from '@/data/mockData';
import { TabType, CoinPackage, Account, Team } from '@/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('coins');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    item: CoinPackage | Account | Team;
    type: 'coin' | 'account' | 'team';
  } | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    switch (activeTab) {
      case 'coins':
        return coinPackages.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      case 'Accounts':
        return Accounts.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  }, [activeTab, searchQuery]);

  const getItemType = (): 'coin' | 'account' => {
    switch (activeTab) {
      case 'coins': return 'coin';
      case 'Accounts': return 'account';
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="px-4 pt-8 pb-6">
        {/* Tab Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-foreground capitalize">
            {activeTab}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} items
          </span>
        </div>

        {/* Featured Section */}
        {filteredItems.some(item => item.featured) && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Featured
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 pt-2 -mx-4 px-4 scrollbar-hide">
              {filteredItems
                .filter(item => item.featured)
                .map(item => (
                  <div key={item.id} className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] md:min-w-[200px] md:max-w-[200px]">
                    <ItemCard
                      item={item}
                      type={getItemType()}
                      onClick={() => setSelectedItem({ item, type: getItemType() })}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* All Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ItemCard
                item={item}
                type={getItemType()}
                onClick={() => setSelectedItem({ item, type: getItemType() })}
              />
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {selectedItem && (
        <OrderModal
          item={selectedItem.item}
          type={selectedItem.type}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Index;
