import { Star, Coins, TrendingUp, Clock } from 'lucide-react';
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
        "glass-card glow-border p-4 text-left transition-all duration-300 hover:scale-[1.02] animate-scale-in overflow-visible h-40 sm:h-48 w-full",
        item.featured && "ring-1 ring-secondary/50"
      )}
    >
      {/* Player Image in Top Right Corner of Card - Outside the image area */}
      {(item as CoinPackage).playerImage && (
        <div className="absolute -top-2 -right-2 w-14 h-16 sm:w-16 sm:h-20 overflow-hidden shadow-2xl z-20" style={{ borderRadius: '16px 16px 24px 24px' }}>
          <img
            src={(item as CoinPackage).playerImage}
            alt="Player"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {/* Region Image (e.g., Japan Flag) in Top Left Corner of Card */}
      {(item as CoinPackage).regionImage && (
        <div className="absolute -top-1 -left-1 w-8 h-6 sm:w-10 sm:h-7 overflow-hidden shadow-xl z-20" style={{ borderRadius: '4px 4px 8px 8px' }}>
          <img
            src={(item as CoinPackage).regionImage}
            alt="Region"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {item.discount && (
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
          {type === 'coin' && (item as CoinPackage).discountPercentage && (
            <div className="discount-tag px-1.5 py-0.5 sm:px-2.5 sm:py-1 animate-pulse-glow">
              <span className="text-[10px] sm:text-sm font-black whitespace-nowrap">
                {t('index.save', 'SAVE')} {(item as CoinPackage).discountPercentage}%
              </span>
            </div>
          )}

          {type === 'coin' && (item as CoinPackage).discountDays && (
            <div className="countdown-tag px-1.5 py-0.5 sm:px-2 sm:py-0.5">
              <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
              <span className="text-[8px] sm:text-[10px] font-bold">
                {(item as CoinPackage).discountDays} Days
              </span>
            </div>
          )}
        </div>
      )}

      <div className="h-16 w-full relative mb-1 sm:mb-3 rounded-lg overflow-hidden group">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-60" />

        {type === 'team' && (
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 flex items-center gap-1 bg-primary px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg shadow-primary/20">
            <Star className="w-3 h-3 fill-current" />
            {(item as Team).rating}
          </div>
        )}
      </div>

      <h3 className="font-display text-[10px] sm:text-sm font-bold text-foreground mb-0.5 truncate leading-tight">
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
