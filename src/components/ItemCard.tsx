import { Star, Coins, TrendingUp } from 'lucide-react';
import { CoinPackage, Account, Team } from '@/types';
import { cn } from '@/lib/utils';
import discountImage from '@/assets/discount.png';

interface ItemCardProps {
  item: CoinPackage | Account | Team;
  type: 'coin' | 'account' | 'team';
  onClick: () => void;
}

export function ItemCard({ item, type, onClick }: ItemCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card glow-border p-4 text-left transition-all duration-300 hover:scale-[1.02] animate-scale-in",
        item.featured && "ring-1 ring-secondary/50"
      )}
    >
      {item.discount && (
        <div className="absolute top-1 right-1 z-10 flex flex-col items-center">
          <img src={discountImage} alt="Discount" className="w-8 h-8" />
          <span className="text-xs font-bold text-white bg-red-600 px-1 py-0.5 rounded">50% OFF</span>
        </div>
      )}
      
      <div className="aspect-square relative mb-3 rounded-lg overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        
        {type === 'coin' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-secondary/90 text-secondary-foreground px-2 py-1 rounded-full text-xs font-bold">
            <Coins className="w-3 h-3" />
            {formatNumber((item as CoinPackage).amount)}
          </div>
        )}
        
        {type === 'account' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            Lv.{(item as Account).level}
          </div>
        )}
        
        {type === 'team' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
            <Star className="w-3 h-3" />
            {(item as Team).rating}
          </div>
        )}
      </div>
      
      <h3 className="font-display text-sm font-semibold text-foreground mb-1 truncate">
        {item.title}
      </h3>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {item.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-bold text-primary">
          ${item.price.toFixed(2)}
        </span>
        
        {type === 'account' && (
          <div className="flex items-center gap-1 text-secondary">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{(item as Account).rating}</span>
          </div>
        )}
        
        {type === 'team' && (
          <span className="text-xs text-muted-foreground">
            {(item as Team).formation}
          </span>
        )}
      </div>
    </button>
  );
}
