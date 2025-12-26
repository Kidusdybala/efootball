import { Coins, Users } from 'lucide-react';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'coins' as TabType, label: 'Coins', icon: Coins },
  { id: 'Accounts' as TabType, label: 'Accounts', icon: Users },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => isAdmin ? onTabChange(tab.id) : navigate(tab.id === 'coins' ? '/coins' : '/accounts')}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-transform duration-300",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-12 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
