import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login({
        username: formData.email,
        password: formData.password
      });

      // Store token
      localStorage.setItem('token', response.access_token);

      // Get user data
      const userData = await api.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));

      // Get profile data and check completion
      const profile = await api.getProfile();

      toast({
        title: "Welcome back!",
        description: "Login successful",
        className: "bg-green-500 text-white",
      });

      // Redirect based on profile completion
      if (!profile.profile_completed) {
        navigate('/dashboard/settings', {
          replace: true,
          state: { requiresCompletion: true }
        });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      let errorMessage = 'Please check your credentials and try again';

      if (error.response?.data?.detail?.includes('credentials')) {
        errorMessage = 'Invalid email or password';
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#0A1B3F] relative overflow-hidden pt-8">
      <Toaster />
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#2D7CFF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[60%] right-[-10%] w-[400px] h-[400px] bg-[#2D7CFF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#2D7CFF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-3">
          <div className="flex items-center justify-center mb-2">
            <h1 className="text-4xl font-bold text-white">
              eval8 ai
            </h1>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-base text-white/80">Sign in to your account</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 flex gap-1.5 mb-6 border border-white/10">
            <Button className="flex-1 bg-[#2D7CFF] text-white hover:bg-[#2D7CFF]/90 shadow-lg text-sm py-4">
              Sign In
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-white/80 hover:bg-white/5 hover:text-[#2D7CFF] text-sm py-4"
              asChild
            >
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#2D7CFF] focus:ring-[#2D7CFF] h-4 w-4" />
                <span className="ml-2 text-white/80 text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#2D7CFF] hover:text-[#2D7CFF]/80 text-sm">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#2D7CFF] hover:bg-[#2D7CFF]/90 text-white text-base rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;







