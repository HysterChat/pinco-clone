import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.requestOtp({ email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.verifyOtp({ email, otp });
            toast.success('OTP verified! Please set your new password.');
            setStep(3);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        try {
            await api.resetPasswordWithOtp({ email, otp, newPassword });
            toast.success('Password reset successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Section */}
            <div className="w-[45%] relative bg-gradient-to-b from-[#4F46E5] to-[#7C3AED] p-16 flex flex-col justify-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-[60%] right-[-10%] w-[400px] h-[400px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 max-w-md mx-auto">
                    <div className="mb-16">
                        <h1 className="text-5xl font-bold text-white mb-6">
                            Reset Password
                        </h1>
                        <p className="text-2xl text-white/90 leading-relaxed">
                            Enter your email address and we'll send you an OTP to reset your password
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-[55%] bg-white flex items-center justify-center p-16">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">Forgot Password</h2>
                        <p className="text-slate-600 text-lg">Follow the steps to reset your password</p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div>
                                <p className="mb-6 text-slate-600">We'll send you an OTP to your email</p>
                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-[#E5E1FF]/30 border-0 text-slate-700 placeholder:text-slate-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <Link to="/login" className="text-[#4F46E5] hover:text-[#4338CA]">
                                    Back to login
                                </Link>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <p className="mb-6 text-slate-600">Enter the OTP sent to your email</p>
                                <div className="space-y-4">
                                    <Input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="h-12 bg-[#E5E1FF]/30 border-0 text-slate-700 placeholder:text-slate-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mr-2"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <p className="mb-6 text-slate-600">Enter your new password</p>
                                <div className="space-y-4">
                                    <Input
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="h-12 bg-[#E5E1FF]/30 border-0 text-slate-700 placeholder:text-slate-500"
                                        required
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 bg-[#E5E1FF]/30 border-0 text-slate-700 placeholder:text-slate-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mr-2"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </Button>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 





