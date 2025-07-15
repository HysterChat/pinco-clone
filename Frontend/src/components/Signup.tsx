import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'free_user' as const // Default to free_user
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "The passwords you entered do not match",
        className: "bg-red-500 text-white",
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password must be at least 6 characters long",
        className: "bg-red-500 text-white",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
        className: "bg-red-500 text-white",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      await api.signup(signupData);

      toast({
        title: "Welcome to eval8 ai!",
        description: "Your account has been created successfully",
        className: "bg-green-500 text-white",
      });

      navigate('/login');
    } catch (error: any) {
      let errorMessage = 'Unable to create account. Please try again';

      const errorDetail = error.response?.data?.detail?.toLowerCase() || '';
      if (errorDetail.includes('email')) {
        errorMessage = 'This email is already registered';
      } else if (errorDetail.includes('username')) {
        errorMessage = 'This username is already taken';
      }

      toast({
        variant: "destructive",
        title: "Registration Failed",
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
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-base text-white/80">Join eval8 ai to start your journey</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 flex gap-1.5 mb-6 border border-white/10">
            <Button
              variant="ghost"
              className="flex-1 text-white/80 hover:bg-white/5 hover:text-[#2D7CFF] text-sm py-4"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="flex-1 bg-[#2D7CFF] text-white hover:bg-[#2D7CFF]/90 shadow-lg text-sm py-4">
              Create Account
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                />
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                />
              </div>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                  minLength={6}
                />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-[#2D7CFF] focus:ring-1 focus:ring-[#2D7CFF] transition-all duration-200 text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#2D7CFF] hover:bg-[#2D7CFF]/90 text-white text-base rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;






