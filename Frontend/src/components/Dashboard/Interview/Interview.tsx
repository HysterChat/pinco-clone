import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, Folder, Loader2, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateInterviewForm from './CreateInterviewForm';
import InterviewFeedback from './InterviewFeedback';
import api, { InterviewAnalysisResponse } from '@/services/api';
import { toast } from 'react-hot-toast';
import { Routes, Route, useNavigate } from 'react-router-dom';
import InterviewList from './InterviewList';
import InterviewSession from './InterviewSession';
import { useToast } from '@/components/ui/use-toast';

interface InterviewCardProps {
    interview: any;
}

const LoadingModal = ({ isOpen }: { isOpen: boolean }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4"
            >
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <div className="w-4 h-4 rounded-full bg-indigo-600 animate-ping" />
                            <div className="w-4 h-4 rounded-full bg-indigo-600 absolute top-0" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Preparing Your Interview
                        </h3>
                        <p className="text-gray-600">
                            We're generating personalized questions based on your interview settings...
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                        <motion.div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const InterviewCard: React.FC<InterviewCardProps> = ({ interview }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleStart = async () => {
        try {
            setIsGenerating(true);
            console.log('DEBUG: Starting interview with details:', interview);

            // Prepare the session data for question generation
            const sessionData = {
                duration: interview.duration,
                difficulty_level: interview.difficulty_level,
                company_name: interview.company_name || undefined,
                interview_focus: interview.interview_focus,
                job_category: interview.job_category,
                sub_job_category: interview.sub_job_category
            };

            // Generate questions before starting the session
            const response = await api.generateQuestion(sessionData);
            console.log('Generated questions:', response);

            // Store questions in localStorage
            localStorage.setItem('currentInterviewQuestions', JSON.stringify(response.questions));
            localStorage.setItem('currentInterviewDetails', JSON.stringify({
                ...sessionData,
                id: interview.id
            }));

            // Open the interview session in a new window with token
            const token = localStorage.getItem('token');
            const url = `/interview-session?id=${interview.id}&token=${encodeURIComponent(token || '')}`;
            window.open(url, '_blank');

        } catch (error) {
            console.error('Error starting interview:', error);
            toast.error('Failed to start interview. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border border-gray-100"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900 break-words">{interview.interview_title}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                            <Folder className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{interview.job_role}</span>
                        </div>
                        {/* Creation time */}
                        <div className="text-xs text-gray-400 mt-1">
                            Created: {interview.created_at ? new Date(interview.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleStart}
                            disabled={isGenerating}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{interview.duration}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2 flex-shrink-0">Category:</span>
                            <span className="truncate">{interview.job_category}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2 flex-shrink-0">Level:</span>
                            <span className="truncate">{interview.difficulty_level}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2 flex-shrink-0">Focus:</span>
                            <span className="truncate">{Array.isArray(interview.interview_focus) ? interview.interview_focus.join(', ') : interview.interview_focus}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                <LoadingModal isOpen={isGenerating} />
            </AnimatePresence>
        </>
    );
};

const Interview = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [subscriptionStatus, setSubscriptionStatus] = useState<{
        status: string;
        plan: string;
        interviews_remaining?: number;
    } | null>(null);
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const response = await api.getAllInterviews();
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id;
                const userInterviews = Array.isArray(response.data)
                    ? response.data.filter((i: any) => i.user_id === userId)
                    : [];
                setInterviews(userInterviews);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load interviews",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
        loadSubscriptionStatus();
    }, [refreshKey]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    const loadSubscriptionStatus = async () => {
        try {
            const status = await api.getSubscriptionStatus();
            setSubscriptionStatus({
                status: status.subscription_status,
                plan: status.is_premium ? 'premium' : 'free',
                interviews_remaining: status.remaining_free_interviews ?? undefined
            });
        } catch (error) {
            console.error('Error loading subscription status:', error);
            toast({
                title: "Error",
                description: "Failed to load subscription status",
                variant: "destructive"
            });
        }
    };

    const handleStartInterview = () => {
        if (subscriptionStatus?.plan === 'free' && subscriptionStatus?.interviews_remaining === 0) {
            toast({
                title: "Subscription Required",
                description: "You've used all your free interviews. Please upgrade to continue.",
                variant: "destructive"
            });
            navigate('/dashboard/subscription');
            return;
        }
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateInterview = () => {
        setIsCreateModalOpen(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="text-gray-600">Loading interviews...</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white-900">My Interviews</h1>
                    <p className="text-white-600 mt-1">
                        {subscriptionStatus?.plan === 'free' 
                            ? `${subscriptionStatus?.interviews_remaining} interview(s) remaining` 
                            : 'Unlimited interviews available'}
                    </p>
                </div>
                <Button onClick={handleStartInterview} className="bg-pinco-lightblue hover:bg-pinco-navy">
                    <Plus className="h-5 w-5 mr-2" />
                    Start New Interview
                </Button>
            </div>

            <Routes>
                <Route index element={<InterviewList />} />
                <Route 
                    path="create" 
                    element={
                        <CreateInterviewForm 
                            open={isCreateModalOpen}
                            onClose={handleCloseCreateInterview}
                            onSuccess={handleCreateSuccess}
                        />
                    } 
                />
                <Route path="session/:id" element={<InterviewSession />} />
                <Route path="feedback/:id" element={
                    selectedInterview ? (
                        <InterviewFeedback
                            feedback={selectedInterview.feedback}
                            onClose={() => setSelectedInterview(null)}
                        />
                    ) : null
                } />
            </Routes>
        </div>
    );
};

export default Interview; 
