import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Demo credentials - in production this would use proper auth
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'aurashop2024',
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
      credentials.username === ADMIN_CREDENTIALS.username &&
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem('admin_authenticated', 'true');
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in to admin panel',
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Access the AuraShop management panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter username"
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter password"
                  className="bg-muted border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="glow" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Store
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo credentials: admin / aurashop2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
