import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle, Clock, Star, TrendingUp } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import Interview from './Interview/Interview';
import FindJobs from './Jobs/FindJobs';
import MyApplications from './Jobs/MyApplications';
import Subscription from './Account/Subscription';
import Support from './Account/Support';
import Resources from './Resources/Resources';
import Progress from './Progress/Progress';
import Settings from './Settings/Settings';
import CreateInterviewForm from './Interview/CreateInterviewForm';
import CollegeDashboard from './College/CollegeDashboard';
import api from '@/services/api';
import { Profile, SubscriptionStatus } from '@/services/api';
import CouponManager from './Admin/CouponManager';
import UserDetails from './Admin/UserDetails';

const DashboardHome = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showCreateInterview, setShowCreateInterview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userData = localStorage.getItem('user');
                let userId = undefined;
                if (userData) {
                    const userObj = JSON.parse(userData);
                    setUser(userObj);
                    userId = userObj.id;
                }

                // Fetch profile data
                const profileData = await api.getProfile();
                setProfile(profileData);

                // Fetch interviews
                const res = await api.getAllInterviews();
                const userInterviews = Array.isArray(res.data)
                    ? res.data.filter((i: any) => i.user_id === userId)
                    : [];
                setInterviews(userInterviews);

                // Fetch subscription status
                const status = await api.getSubscriptionStatus();
                setSubscriptionStatus(status);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleOpenCreateInterview = () => setShowCreateInterview(true);
    const handleCloseCreateInterview = () => setShowCreateInterview(false);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eval8 ai-lightblue"></div>
        </div>;
    }

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-eval8 ai-white">
                        Hello, {profile?.full_name || user?.username || user?.email || 'User'}
                    </h1>
                    <p className="text-eval8 ai-white">
                        {profile?.email && <span className="mr-2">{profile.email}</span>}
                        {profile?.experience_level && (
                            <span className="ml-2 px-2 py-1 bg-eval8 ai-lightblue text-eval8 ai-white rounded text-xs">
                                {profile.experience_level.toUpperCase()} Level
                            </span>
                        )}
                    </p>
                    <p className="text-eval8 ai-white">Let's prepare for your next interview success</p>
                </div>
                <Button className="bg-eval8 ai-lightblue hover:bg-eval8 ai-navy text-eval8 ai-white flex items-center gap-2" onClick={handleOpenCreateInterview}>
                    <Plus className="h-5 w-5" />
                    Create New Interview
                </Button>
            </div>

            <CreateInterviewForm open={showCreateInterview} onClose={handleCloseCreateInterview} onSuccess={() => {
                // Refresh profile data after new interview
                api.getProfile().then(setProfile);
            }} />

            {/* Subscription Banner */}
            {!subscriptionStatus?.is_premium && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-gradient-to-r from-eval8 ai-lightblue/90 to-eval8 ai-navy/90 rounded-xl p-6 text-eval8 ai-white"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Upgrade to Premium</h2>
                            <p className="text-eval8 ai-white">
                                {!subscriptionStatus?.can_take_interview
                                    ? "You've used all your free interviews. Upgrade now for unlimited interviews and Versant rounds!"
                                    : `${subscriptionStatus?.remaining_free_interviews ?? 0} interview${subscriptionStatus?.remaining_free_interviews === 1 ? '' : 's'} remaining. Upgrade for unlimited access!`}
                            </p>
                        </div>
                        <Button
                            className="bg-eval8 ai-white text-eval8 ai-navy hover:bg-eval8 ai-lightblue"
                            onClick={() => navigate('/dashboard/subscription')}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Completed Interviews */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-eval8 ai-white rounded-xl p-6 shadow-sm border border-eval8 ai-gray"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-eval8 ai-gray mb-1">Completed Interviews</p>
                            <h3 className="text-3xl font-bold text-eval8 ai-navy">{profile?.completed_interviews || 0}</h3>
                            <p className="text-sm text-eval8 ai-gray mt-1">Total interviews completed</p>
                        </div>
                        <div className="bg-eval8 ai-lightblue p-2 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-eval8 ai-navy" />
                        </div>
                    </div>
                </motion.div>

                {/* Hours Practiced */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-eval8 ai-white rounded-xl p-6 shadow-sm border border-eval8 ai-gray"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-eval8 ai-gray mb-1">Hours Practiced</p>
                            <h3 className="text-3xl font-bold text-eval8 ai-navy">{profile?.hours_practiced?.toFixed(2) || '0.00'}</h3>
                            <p className="text-sm text-eval8 ai-gray mt-1">Total practice time</p>
                        </div>
                        <div className="bg-eval8 ai-lightblue p-2 rounded-lg">
                            <Clock className="h-6 w-6 text-eval8 ai-navy" />
                        </div>
                    </div>
                </motion.div>

                {/* Average Score */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-eval8 ai-white rounded-xl p-6 shadow-sm border border-eval8 ai-gray"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-eval8 ai-gray mb-1">Average Score</p>
                            <h3 className="text-3xl font-bold text-eval8 ai-navy">{profile?.average_score || 0}%</h3>
                            <p className="text-sm text-eval8 ai-gray mt-1">Overall performance</p>
                        </div>
                        <div className="bg-eval8 ai-lightblue p-2 rounded-lg">
                            <Star className="h-6 w-6 text-eval8 ai-navy" />
                        </div>
                    </div>
                </motion.div>

                {/* Total Score */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-eval8 ai-white rounded-xl p-6 shadow-sm border border-eval8 ai-gray"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-eval8 ai-gray mb-1">Total Score</p>
                            <h3 className="text-3xl font-bold text-eval8 ai-navy">{profile?.total_score || 0}</h3>
                            <p className="text-sm text-eval8 ai-gray mt-1">Cumulative score</p>
                        </div>
                        <div className="bg-eval8 ai-lightblue p-2 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-eval8 ai-navy" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Interviews Section */}
            <div className="bg-eval8 ai-white rounded-xl p-6 shadow-sm border border-eval8 ai-gray">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-eval8 ai-navy">Total Interviews</h2>
                        <span className="text-sm text-eval8 ai-gray">{interviews.length} Total</span>
                    </div>
                    {/* <Button variant="ghost" className="text-eval8 ai-navy hover:text-eval8 ai-navy">
                        View all
                    </Button> */}
                </div>

                {/* Progress Overview */}
                {/* <div className="mt-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="text-eval8 ai-navy bg-eval8 ai-white">Week</Button>
                        <Button variant="ghost" className="text-eval8 ai-gray">Month</Button>
                        <Button variant="ghost" className="text-eval8 ai-gray">Year</Button>
                    </div>
                </div> */}
            </div>
        </>
    );
};

const Dashboard = () => {
    return (
        <DashboardLayout>
            <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="interviews/*" element={<Interview />} />
                <Route path="jobs/*" element={<FindJobs />} />
                <Route path="applications/*" element={<MyApplications />} />
                <Route path="subscription/*" element={<Subscription />} />
                <Route path="support/*" element={<Support />} />
                <Route path="resources/*" element={<Resources />} />
                <Route path="progress/*" element={<Progress />} />
                <Route path="settings/*" element={<Settings />} />
                <Route path="college/*" element={<CollegeDashboard />} />
                <Route path="coupons" element={<CouponManager />} />
                <Route path="details" element={<UserDetails />} />
            </Routes>
        </DashboardLayout>
    );
};

export default Dashboard; 






