import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import heroBanner from '@/assets/hero-banner.jpg';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="relative">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={heroBanner} 
          alt="AuraShop eFootball Marketplace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Signup Button */}
        <button className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 font-medium">
          <UserPlus className="w-5 h-5" />
          <span>Sign Up</span>
        </button>
        
        {/* Logo & Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
            AURASHOP
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Premium eFootball Coins, Accounts & Teams
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="glass-card p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search coins, accounts, teams..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
