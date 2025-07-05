import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    Video,
    LineChart,
    Briefcase,
    UserCircle,
    CreditCard,
    LifeBuoy,
    Book,
    Settings,
    FileText,
    ChevronRight,
    Mic,
    Menu,
    X,
    LogOut,
    BookOpen,
    MessageSquare,
    Puzzle,
    MessageCircle,
    Tag
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = async () => {
        try {
            // Clear local storage first
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            toast({
                title: "Success",
                description: "Logged out successfully",
            });

            // Redirect to login page
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to logout. Please try again.",
            });
        }
    };

    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const SidebarContent = () => {
        const isAdmin = user?.accountType === 'admin';
        const baseClasses = (isActive: boolean) => `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-pinco-lightblue bg-pinco-lightblue/10' : 'text-pinco-gray hover:text-pinco-lightblue hover:bg-pinco-lightblue/10'}`;

        return (
            <>
                {/* Logo */}
                <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="relative">
                        <div className="h-11 w-11 bg-pinco-lightblue/10 rounded-xl flex items-center justify-center">
                            <Mic className="h-6 w-6 text-pinco-lightblue" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-xl font-semibold text-pinco-white">eval8</span>
                </Link>

                {/* Main Menu */}
                <div className="p-6 space-y-8">
                    <h2 className="mb-3 px-3 text-xs font-semibold text-pinco-gray uppercase tracking-wider">
                        MAIN MENU
                    </h2>
                    <div className="space-y-1">
                        <Link
                            to="/dashboard"
                            className={baseClasses(isActiveRoute('/dashboard'))}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <LayoutGrid className="h-5 w-5 shrink-0" />
                            Dashboard
                        </Link>
                        <Link
                            to="/dashboard/interviews"
                            className={baseClasses(isActiveRoute('/dashboard/interviews'))}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Video className="h-5 w-5 shrink-0" />
                            My Interviews
                        </Link>
                        <Link
                            to="/dashboard/progress"
                            className={baseClasses(isActiveRoute('/dashboard/progress'))}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <LineChart className="h-5 w-5 shrink-0" />
                            Progress
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/dashboard/coupons"
                                className={baseClasses(isActiveRoute('/dashboard/coupons'))}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Tag className="h-5 w-5 mr-3" />
                                Coupons
                            </Link>
                        )}
                    </div>
                </div>

                {/* Versant Tests Section */}
                <div className="p-6 space-y-8">
                    <h2 className="mb-3 px-3 text-xs font-semibold text-pinco-gray uppercase tracking-wider">
                        VERSANT TESTS
                    </h2>
                    <div className="space-y-1">
                        <button
                            onClick={async () => {
                                try {
                                    const subscription = await api.getSubscriptionStatus();
                                    if (subscription.can_access_versant) {
                                        navigate('/dashboard/versant/flow');
                                    } else {
                                        toast({
                                            variant: "destructive",
                                            title: "Premium Feature",
                                            description: "Versant rounds are only available for premium users. Please upgrade to access this feature."
                                        });
                                        setTimeout(() => {
                                            navigate('/dashboard/subscription');
                                        }, 2000);
                                    }
                                } catch (error) {
                                    console.error('Error checking subscription:', error);
                                    toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description: "Failed to check subscription status. Please try again."
                                    });
                                }
                                setIsMobileMenuOpen(false);
                            }}
                            className={baseClasses(isActiveRoute('/dashboard/versant/flow'))}
                        >
                            <BookOpen className="h-5 w-5 shrink-0" />
                            Start Versant Test
                        </button>
                    </div>
                </div>

                {/* Account */}
                <div className="p-6 space-y-8">
                    <h2 className="mb-3 px-3 text-xs font-semibold text-pinco-gray uppercase tracking-wider">
                        ACCOUNT
                    </h2>
                    <div className="space-y-1">
                        <Link
                            to="/dashboard/subscription"
                            className={baseClasses(isActiveRoute('/dashboard/subscription'))}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <CreditCard className="h-5 w-5 shrink-0" />
                            Subscription
                        </Link>
                        <Link
                            to="/dashboard/support"
                            className={baseClasses(isActiveRoute('/dashboard/support'))}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <LifeBuoy className="h-5 w-5 shrink-0" />
                            Support
                        </Link>
                    </div>
                </div>

                {/* Resources */}
                <div className="p-6 space-y-8">
                    <h2 className="mb-3 px-3 text-xs font-semibold text-pinco-gray uppercase tracking-wider">
                        SETTINGS
                    </h2>
                    <div className="space-y-1">
                        <Link
                            to="/dashboard/settings"
                            className={baseClasses(isActiveRoute('/dashboard/settings'))}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Settings className="h-5 w-5 shrink-0" />
                            Settings
                        </Link>
                    </div>
                </div>

                {/* User Profile */}
                <div className="mt-auto p-6 border-t border-pinco-gray">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-pinco-white transition-colors">
                        <div className="h-9 w-9 rounded-lg bg-pinco-lightblue/10 flex items-center justify-center text-pinco-lightblue">
                            <span className="text-sm font-medium">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-pinco-lightblue truncate">
                                {user?.fullName || user?.username || 'User'}
                            </p>
                            <p className="text-xs text-pinco-lightblue truncate">
                                {user?.accountType === 'admin' ? 'Administrator' : 
                                 user?.accountType === 'employer' ? 'Employer' : 'Job Seeker'} • {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Logout
                    </button>
                </div>
            </>
        );
    };

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-pinco-white shadow-md hover:bg-pinco-lightblue/10"
            >
                {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-pinco-gray" />
                ) : (
                    <Menu className="h-6 w-6 text-pinco-gray" />
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-[280px] bg-pinco-navy text-pinco-white transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto`}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-[280px] bg-pinco-navy text-pinco-white border-r border-pinco-gray h-screen fixed left-0 top-0 flex-col">
                <div className="flex-1 overflow-y-auto">
                    <SidebarContent />
                </div>
            </div>
        </>
    );
};

export default Sidebar; 
