import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onLogout: () => void;
  onProfileClick: () => void;
}

export function AdminHeader({ onLogout, onProfileClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold text-gradient truncate">AURA SHOP</h1>
          <p className="text-xs text-muted-foreground truncate">Admin Panel</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onProfileClick} className="whitespace-nowrap">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Profile</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout} className="whitespace-nowrap">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}