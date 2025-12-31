import { Star, Coins, TrendingUp } from 'lucide-react';
import { CoinPackage, Account, Team } from '@/types';
import { cn } from '@/lib/utils';
import discountImage from '@/assets/discount.png';
import { useTranslation } from 'react-i18next';

interface ItemCardProps {
  item: CoinPackage | Account | Team;
  type: 'coin' | 'account' | 'team';
  onClick: () => void;
}

export function ItemCard({ item, type, onClick }: ItemCardProps) {
  const { t } = useTranslation();

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-card glow-border p-4 text-left transition-all duration-300 hover:scale-[1.02] animate-scale-in overflow-hidden h-40 sm:h-48 w-full",
        item.featured && "ring-1 ring-secondary/50"
      )}
    >
      {item.discount && (
        <div className="absolute top-0.5 right-0.5 z-10 flex flex-col items-center">
          <img src={discountImage} alt="Discount" className="w-3 h-3 sm:w-8 sm:h-8" />
          {type === 'coin' && (item as CoinPackage).discountPercentage && (
            <span className="text-[6px] sm:text-xs font-bold text-white bg-red-600 px-0.5 sm:px-1 py-0.5 rounded">
              {(item as CoinPackage).discountPercentage}{t('index.off')}
            </span>
          )}
          {type === 'coin' && (item as CoinPackage).discountDays && (
            <span className="text-[6px] sm:text-xs font-bold text-white bg-red-600 px-0.5 sm:px-1 py-0.5 rounded mt-0.5 sm:mt-1">
              {(item as CoinPackage).discountDays} {t('index.days', 'days')}
            </span>
          )}
        </div>
      )}
      
      <div className="h-16 w-full relative mb-0.5 sm:mb-3 rounded-lg overflow-hidden">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        
        
        
        {type === 'team' && (
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
            <Star className="w-3 h-3" />
            {(item as Team).rating}
          </div>
        )}
      </div>
      
      <h3 className="font-display text-[8px] sm:text-sm font-semibold text-foreground mb-0 truncate">
        {item.title}
      </h3>

      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-0.5">
        {item.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {item.discount && type === 'coin' && (item as CoinPackage).discountPercentage ? (
            <>
              <span className="text-[8px] sm:text-xs text-muted-foreground line-through">
                {(item.price / (1 - (item as CoinPackage).discountPercentage / 100)).toFixed(2)}
              </span>
              <span className="font-display text-[10px] sm:text-lg font-bold text-primary">
                {item.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-display text-[10px] sm:text-lg font-bold text-primary">
              {item.price.toFixed(2)}
            </span>
          )}
        </div>


        {type === 'team' && (
          <span className="text-[8px] sm:text-xs text-muted-foreground">
            {(item as Team).formation}
          </span>
        )}
      </div>
    </button>
  );
}
