import { Search, UserPlus, Youtube, MessageCircle, LogOut, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import i18n from '../i18n';
import heroBanner from '@/assets/header.JPG';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { t } = useTranslation();
  const { user, isLoggedIn, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  return (
    <header className="relative">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={heroBanner} 
          alt="Aura Shop eFootball Marketplace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Social Icons */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Link
            to="/admin"
            className="p-2 rounded-lg bg-black/50 hover:bg-black/60 transition-colors duration-300"
            title="Admin Login"
          >
            <Shield className="w-6 h-6 text-yellow-500" />
          </Link>
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

        {/* Language Selector and User Info */}
        <div className="absolute top-4 right-4 flex items-center gap-1 sm:gap-2">
          <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
            <SelectTrigger className="w-16 sm:w-24 h-6 sm:h-8 text-[10px] sm:text-xs bg-black/50 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="am">አማርኛ</SelectItem>
            </SelectContent>
          </Select>
          {isLoggedIn && user ? (
            <div className="flex items-center gap-1">
              <span className="text-white text-sm">{(user.name?.split(' ')[0] || user.email.split('@')[0]).charAt(0).toUpperCase()}</span>
              <button onClick={() => setShowLogoutConfirm(true)} className="ml-1 p-1 hover:bg-white/20 rounded text-white">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/signup" className="flex items-center gap-1 px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 font-medium">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('header.signUp')}</span>
            </Link>
          )}
        </div>
        
        {/* Logo & Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
            {t('header.title')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('header.subtitle')}
          </p>
          <p className="text-primary font-semibold text-sm md:text-base mt-1">
            +251 90 984 4959
          </p>
          <a href="https://t.me/YAMAL_AURA" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold text-sm md:text-base mt-1 block hover:underline">
            @YAMAL_AURA
          </a>
        </div>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { logout(); setShowLogoutConfirm(false); }}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search Bar */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="glass-card p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('header.searchPlaceholder')}
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
