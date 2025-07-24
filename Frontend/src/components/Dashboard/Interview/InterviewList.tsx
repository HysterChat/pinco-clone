import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Play, Clock, Folder, Loader2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Loading Modal Component
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

// Error Modal Component
const ErrorModal = ({ isOpen, onClose, onUpgrade }: { isOpen: boolean; onClose: () => void; onUpgrade: () => void }) => {
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
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Interview Limit Reached
                        </h3>
                        <p className="text-gray-600 mb-6">
                            You've reached your free interview limit. Upgrade to our premium plan to continue practicing with unlimited interviews.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={onUpgrade}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Upgrade Now
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const InterviewList = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});
    const [showLimitError, setShowLimitError] = useState(false);

    useEffect(() => {
        const fetchInterviews = async () => {
            setLoading(true);
            try {
                const res = await api.getAllInterviews();
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id;
                const userInterviews = Array.isArray(res.data)
                    ? res.data.filter((i: any) => i.user_id === userId)
                    : [];
                setInterviews(userInterviews);
            } catch (error) {
                toast.error('Failed to load interviews');
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const handleStart = async (interview: any) => {
        try {
            setIsGenerating({ ...isGenerating, [interview.id]: true });
            console.log('DEBUG: Starting interview with details:', interview);

            // Prepare the session data
            const sessionData = {
                duration: interview.duration,
                difficulty_level: interview.difficulty_level,
                company_name: interview.company_name || undefined,
                interview_focus: interview.interview_focus,
                job_category: interview.job_category,
                sub_job_category: interview.sub_job_category
            };

            // Generate questions
            const response = await api.generateQuestion(sessionData);
            console.log('Generated questions:', response);

            // Store in localStorage
            localStorage.setItem('currentInterviewQuestions', JSON.stringify(response.questions));
            localStorage.setItem('currentInterviewDetails', JSON.stringify({
                ...sessionData,
                id: interview.id
            }));

            // Open interview session in new window
            const token = localStorage.getItem('token');
            const url = `/interview-session?id=${interview.id}&token=${encodeURIComponent(token || '')}`;
            window.open(url, '_blank');

        } catch (error: any) {
            console.error('Error starting interview:', error);
            if (error.status === 403 || error?.response?.status === 403) {
                setShowLimitError(true);
            } else {
                toast.error('Failed to start interview. Please try again.');
            }
        } finally {
            setIsGenerating({ ...isGenerating, [interview.id]: false });
        }
    };

    const handleUpgrade = () => {
        setShowLimitError(false);
        navigate('/dashboard/subscription');
    };

    if (loading) return <div className="p-4">Loading interviews...</div>;

    return (
        <>
            <AnimatePresence mode="wait">
                {Object.values(isGenerating).some(Boolean) && (
                    <LoadingModal key="loading-modal" isOpen={Object.values(isGenerating).some(Boolean)} />
                )}
                {showLimitError && (
                    <ErrorModal
                        key="error-modal"
                        isOpen={showLimitError}
                        onClose={() => setShowLimitError(false)}
                        onUpgrade={handleUpgrade}
                    />
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                {interviews.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-500">No interviews found.</div>
                ) : (
                    interviews.map((interview) => (
                        <motion.div
                            key={interview.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border border-white-100"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                                        {interview.interview_title}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Folder className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        <span className="truncate">{interview.job_role}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Created: {interview.created_at ? new Date(interview.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleStart(interview)}
                                    disabled={isGenerating[interview.id]}
                                    className="w-full sm:w-auto bg-primary hover:bg-black text-white"
                                >
                                    {isGenerating[interview.id] ? (
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
                                        <span className="truncate">
                                            {Array.isArray(interview.interview_focus)
                                                ? interview.interview_focus.join(', ')
                                                : interview.interview_focus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </>
    );
};

export default InterviewList; 






