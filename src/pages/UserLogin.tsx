import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User as UserType } from '@/types';

export default function UserLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users: UserType[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);

    if (user) {
      localStorage.setItem('user_authenticated', JSON.stringify(user));
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
      navigate('/');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
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
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              User Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}