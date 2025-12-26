import { Search, UserPlus, Youtube, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import heroBanner from '@/assets/header.JPG';

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
        
        {/* Social Icons */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <a
            href="https://t.me/aurashop333"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-black/50 hover:bg-black/60 transition-colors duration-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          <a
            href="https://youtube.com/@efb_aura?si=J9pwWWC3GbbyqkbN"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-black/50 hover:bg-black/60 transition-colors duration-300"
          >
            <Youtube className="w-6 h-6 text-red-500" />
          </a>
        </div>

        {/* Signup Button */}
        <button className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 font-medium">
          <UserPlus className="w-5 h-5" />
          <span>Sign Up</span>
        </button>
        
        {/* Logo & Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
            AURA SHOP
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Premium eFootball Coins, Accounts & Accounts
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="glass-card p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search coins, accounts, Accounts..."
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
