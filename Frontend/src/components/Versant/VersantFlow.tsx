import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Reading from './Reading';
import RepeatSentence from './RepeatSentence';
import SentenceBuild from './SentenceBuild';
import RetellingRound from './RetellingRound';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import VersantTimer from './VersantTimer';
import { Check, Volume2, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import OpenResponse from './OpenResponse';
import API from '../../services/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Update types at the top
type RoundResultInput = {
    audioUrl?: string;
    audioBlob?: Blob;
    transcription?: string;
    text?: string;
    question?: string;
    sentenceIndex?: number;
    index?: number;
    userSentence?: string;
};

type ResponseDetail = {
    audioUrl?: string;
    transcription?: string;
    question?: string;
    text?: string;
};

type RoundResult = {
    roundName: string;
    timestamp: Date;
    details: ResponseDetail[];
    score?: number;  // Make score optional
};

type RoundComponent = {
    name: string;
    component: React.ComponentType<any>;
    props: any;
};

interface SubscriptionResponse {
    is_premium: boolean;
    subscription_status: string;
    subscription_end_date: string | null;
    completed_interviews: number;
    can_take_interview: boolean;
    can_access_versant: boolean;
    remaining_free_interviews: number | null;
}

const VersantFlow: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentRound, setCurrentRound] = useState<number>(0);
    const [results, setResults] = useState<RoundResult[]>([]);
    const [showReview, setShowReview] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [versantFeedback, setVersantFeedback] = useState<string | null>(null);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionResponse | null>(null);
    const [audioBlobs, setAudioBlobs] = useState<{ [key: string]: Blob }>({});
    const audioUrlsRef = useRef<string[]>([]);
    const [versantScore, setVersantScore] = useState<number | null>(null);

    const shortAnswerQuestions = [
        "What do you usually do in your free time?",
        "What kind of food do you like to eat?",
        "Describe your typical morning routine.",
        "What is your favorite season and why?",
        "How do you prefer to travel on vacation?"
    ];

    const startTimer = () => {
        if (!isTestStarted) {
            setIsTestStarted(true);
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
    };

    const rounds: RoundComponent[] = [
        {
            name: 'Reading Test',
            component: Reading,
            props: {
                onComplete: (roundResults: any) => {
                    console.log('Reading Test completed:', roundResults);
                    console.log('Reading Test recordings with transcripts:', roundResults.map((r: any) => ({
                        index: r.sentenceIndex,
                        transcript: r.transcript
                    })));
                    handleRoundComplete({
                        details: roundResults.map((recording: any) => ({
                            audioUrl: recording.audioUrl,
                            audioBlob: recording.audioBlob,
                            transcription: recording.transcript,
                            text: `Reading ${recording.sentenceIndex + 1}`
                        }))
                    });
                },
                onStart: startTimer
            }
        },
        {
            name: 'Repeat Sentence',
            component: RepeatSentence,
            props: {
                onComplete: (roundResults: any) => {
                    console.log('Repeat Sentence completed:', roundResults);
                    console.log('Repeat Sentence recordings with transcripts:', roundResults.map((r: any) => ({
                        index: r.sentenceIndex,
                        transcript: r.transcript
                    })));
                    handleRoundComplete({
                        details: roundResults.map((recording: any) => ({
                            audioUrl: recording.audioUrl,
                            audioBlob: recording.audioBlob,
                            transcription: recording.transcript,
                            text: `Repeat ${recording.sentenceIndex + 1}`
                        }))
                    });
                },
                onStart: startTimer
            }
        },
        {
            name: 'Sentence Build',
            component: SentenceBuild,
            props: {
                onComplete: (roundResults: any) => {
                    console.log('Sentence Build completed:', roundResults);
                    console.log('Sentence Build results with transcripts:', roundResults.map((r: any) => ({
                        userSentence: r.userSentence,
                        transcript: r.transcript
                    })));
                    handleRoundComplete({
                        details: roundResults.map((result: any) => ({
                            audioUrl: result.audioUrl,
                            audioBlob: result.audioBlob,
                            transcription: result.transcript,
                            text: result.userSentence
                        }))
                    });
                },
                onStart: startTimer
            }
        },
        {
            name: 'Retelling Round',
            component: RetellingRound,
            props: {
                onComplete: (roundResults: any) => {
                    console.log('Retelling Round completed:', roundResults);
                    handleRoundComplete({
                        details: roundResults.map((recording: any) => ({
                            audioUrl: recording.audioUrl,
                            audioBlob: recording.audioBlob,
                            transcription: recording.transcript || recording.transcription,
                            text: recording.story || `Retelling ${recording.index + 1}`
                        }))
                    });
                },
                onStart: startTimer
            }
        },
        {
            name: 'Short Answer',
            component: ShortAnswerQuestion,
            props: {
                questions: shortAnswerQuestions,
                onComplete: (roundResults: any) => {
                    console.log('Short Answer completed:', roundResults);
                    handleRoundComplete({
                        details: roundResults.map((answer: any, idx: number) => ({
                            audioUrl: answer.audioUrl,
                            audioBlob: answer.audioBlob,
                            transcription: answer.transcript,
                            question: answer.question || shortAnswerQuestions[idx]
                        }))
                    });
                },
                onStart: startTimer
            }
        },
        {
            name: 'Open Question Round',
            component: OpenResponse,
            props: {
                onComplete: (roundResults: any) => {
                    console.log('Open Question completed:', roundResults);
                    handleRoundComplete({
                        details: roundResults.audioUrls.map((url: string, idx: number) => ({
                            audioUrl: url,
                            audioBlob: roundResults.audioBlobs?.[idx],
                            transcription: roundResults.transcriptions?.[idx],
                            text: `Open Question ${idx + 1}`
                        }))
                    });
                },
                onStart: startTimer
            }
        }
    ];

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // Cleanup all audio URLs
            audioUrlsRef.current.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    const handleRoundComplete = async (roundResults: { details: RoundResultInput[] }) => {
        try {
            const processedDetails = await Promise.all(roundResults.details.map(async (detail) => {
                let processedDetail: ResponseDetail = {
                    text: detail.text || '',
                    transcription: detail.transcription || '' // Preserve transcription
                };

                // Handle both audioBlob and audioUrl
                if (detail.audioBlob && detail.audioBlob instanceof Blob) {
                    try {
                        const base64Data = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                    resolve(reader.result);
                                } else {
                                    reject(new Error('Invalid reader result'));
                                }
                            };
                            reader.onerror = () => reject(new Error('Failed to read blob'));
                            reader.readAsDataURL(detail.audioBlob!);
                        });
                        processedDetail.audioUrl = base64Data;
                    } catch (error) {
                        console.error('Error converting audio to base64:', error);
                        toast({
                            title: "Warning",
                            description: "Failed to save audio data. Playback may not work in review.",
                            variant: "destructive"
                        });
                    }
                } else if (detail.audioUrl) {
                    // If we have a URL but no blob, store the URL
                    processedDetail.audioUrl = detail.audioUrl;

                    // Try to fetch the blob from URL if it's a blob URL
                    if (detail.audioUrl.startsWith('blob:')) {
                        try {
                            const response = await fetch(detail.audioUrl);
                            const blob = await response.blob();
                            const base64Data = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.onerror = () => reject(new Error('Failed to read blob'));
                                reader.readAsDataURL(blob);
                            });
                            processedDetail.audioUrl = base64Data;
                        } catch (error) {
                            console.error('Error converting blob URL to base64:', error);
                        }
                    }
                }

                return processedDetail;
            }));

            // No filtering by transcription, just use all processedDetails
            const newResult: RoundResult = {
                roundName: rounds[currentRound].name,
                timestamp: new Date(),
                details: processedDetails
            };

            setResults(prev => [...prev, newResult]);
            setCurrentRound(prev => prev + 1);
        } catch (error) {
            console.error('Error processing round results:', error);
            toast({
                title: "Error",
                description: "Failed to save round results. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handlePlayAudio = async (audioUrl: string) => {
        if (currentlyPlaying === audioUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
                setCurrentlyPlaying(null);
            }
            return;
        }

        try {
            // Stop current playback
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // Create audio element
            const audio = new Audio();

            // Set up error handling first
            audio.onerror = (e) => {
                console.error('Audio element error:', e);
                throw new Error('Failed to load audio');
            };

            // Handle base64 data
            if (audioUrl.startsWith('data:')) {
                audio.src = audioUrl;
            } else if (audioUrl.startsWith('blob:')) {
                // For blob URLs, try to fetch the data and convert to base64
                try {
                    const response = await fetch(audioUrl);
                    const blob = await response.blob();
                    const base64Data = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = () => reject(new Error('Failed to read blob'));
                        reader.readAsDataURL(blob);
                    });
                    audio.src = base64Data;
                } catch (error) {
                    console.error('Error converting blob to base64:', error);
                    throw new Error('Failed to load audio data');
                }
            } else {
                audio.src = audioUrl;
            }

            // Load and play
            await audio.load();
            await audio.play();

            audioRef.current = audio;
            setCurrentlyPlaying(audioUrl);

            // Cleanup on end
            audio.onended = () => {
                setCurrentlyPlaying(null);
                audioRef.current = null;
            };

        } catch (error) {
            console.error('Error in handlePlayAudio:', error);
            toast({
                title: "Error",
                description: "Failed to play audio. Please try again.",
                variant: "destructive"
            });
            setCurrentlyPlaying(null);
            audioRef.current = null;
        }
    };

    // Add this function to check if audio URL is valid
    const isValidAudioUrl = (url: string | undefined): boolean => {
        if (!url) return false;
        return url.startsWith('blob:') || url.startsWith('http:') || url.startsWith('https:');
    };

    const calculateOverallScore = () => {
        if (results.length === 0) return 0;
        const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
        return Math.round(totalScore / results.length);
    };

    // Effect to log state changes (helpful for debugging)
    useEffect(() => {
        console.log('Current round:', currentRound);
        console.log('Results:', results);
        console.log('Show review:', showReview);
    }, [currentRound, results, showReview]);

    // Add function to get all transcriptions
    const getAllTranscriptions = () => {
        console.log('Starting to collect all transcriptions...');
        const transcriptions: string[] = [];

        results.forEach((result, roundIndex) => {
            console.log(`Processing round ${roundIndex + 1}: ${result.roundName}`);

            // Add round name as context
            transcriptions.push(`=== ${result.roundName} ===`);

            result.details.forEach((detail, detailIndex) => {
                if (detail.transcription && detail.transcription !== 'No transcription available' && detail.transcription !== 'Error transcribing audio') {
                    let context = '';
                    if (detail.question) {
                        context = `Q: ${detail.question}\nA: `;
                    } else if (detail.text) {
                        context = `${detail.text}\nResponse: `;
                    }
                    const formattedTranscription = `${context}${detail.transcription.trim()}`;
                    console.log(`Round ${roundIndex + 1}, Response ${detailIndex + 1}:`, formattedTranscription);
                    transcriptions.push(formattedTranscription);
                } else {
                    console.log(`Round ${roundIndex + 1}, Response ${detailIndex + 1}: Invalid or missing transcription`);
                }
            });

            // Add separator between rounds
            transcriptions.push('---');
        });

        // Log transcriptions for debugging
        console.log('All collected transcriptions:', transcriptions);

        // Filter out separators and empty transcriptions
        const filteredTranscriptions = transcriptions.filter(t => t && t !== '---' && !t.startsWith('==='));
        console.log('Filtered transcriptions to send:', filteredTranscriptions);

        return filteredTranscriptions;
    };

    // Add function to get feedback
    const getVersantFeedback = async () => {
        console.log('Starting Versant feedback process...');
        const transcriptions = getAllTranscriptions();

        if (transcriptions.length === 0) {
            console.warn('No transcriptions available for feedback');
            toast({
                title: "Warning",
                description: "No valid transcriptions available to analyze. Please ensure your microphone is working and try again.",
                variant: "destructive"
            });
            return;
        }

        console.log('Found valid transcriptions:', transcriptions.length);
        setIsLoadingFeedback(true);

        try {
            console.log('Calling Versant feedback API...');
            const response = await API.getVersantFeedback(transcriptions);
            console.log('Raw API Response:', response);

            if (response.status === 'success' && response.areas_for_improvement) {
                console.log('Successfully received feedback:', {
                    status: response.status,
                    feedback: response.areas_for_improvement,
                    score: response.total_score
                });
                setVersantFeedback(response.areas_for_improvement);
                setVersantScore(response.total_score);
            } else {
                console.error('Invalid feedback response structure:', response);
                throw new Error('Invalid feedback response');
            }
        } catch (error) {
            console.error('Error getting versant feedback:', error);
            toast({
                title: "Error",
                description: "Failed to get feedback analysis. Please try again later.",
                variant: "destructive"
            });
            setVersantFeedback(null);
            setVersantScore(null);
        } finally {
            setIsLoadingFeedback(false);
            console.log('Versant feedback process completed');
        }
    };

    // Call getVersantFeedback when showing review
    useEffect(() => {
        if (showReview) {
            console.log('Starting Versant feedback process...');
            getVersantFeedback();
        }
    }, [showReview]);

    // Update subscription status check
    const checkSubscriptionStatus = async () => {
        try {
            const response = await API.getSubscriptionStatus();
            if (response) {
                setSubscriptionStatus(response);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
            toast({
                title: "Error",
                description: "Failed to check subscription status. Some features may be limited.",
                variant: "destructive"
            });
        }
    };

    // Add effect to check subscription on mount
    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    if (showDisclaimer) {
        return (
            <Dialog open={showDisclaimer}>
                <DialogContent
                    className="bg-[#1e293b] text-white border-none"
                    style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-blue-400 mb-2 text-center">Disclaimer for Versant Round Practice</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2" style={{ minHeight: '200px' }}>
                        <div className="space-y-4 text-base text-gray-200">
                            <p className="text-lg font-semibold text-center">Welcome to the Versant Round Practice Module on eval8 ai.</p>
                            <p>Before you begin, please read the following important information carefully:</p>
                            <div className="bg-blue-900/40 rounded-lg p-4 border border-blue-700">
                                <p className="font-semibold text-blue-300 mb-2">Disclaimer:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>This practice test is designed to simulate the real Versant round conducted by various companies.</li>
                                    <li>The structure, question types, and difficulty level of this test are based on commonly observed formats used by companies during their hiring process.</li>
                                    <li>Different companies may use different variations of the Versant test depending on:
                                        <ul className="list-disc pl-6 mt-1">
                                            <li>Job role (e.g., IT Support vs. Business Analyst)</li>
                                            <li>Experience level (Fresher vs. Experienced)</li>
                                            <li>Internal assessment policies and vendor customizations</li>
                                        </ul>
                                    </li>
                                    <li>As a result, the number of sections, time duration, and type of questions in the actual test may differ slightly or significantly from this practice version.</li>
                                </ul>
                            </div>
                            <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                                <p className="font-semibold text-blue-200 mb-2">Important Notes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>This tool is meant to help you prepare and build confidence by giving you a close-to-real experience.</li>
                                    <li>We do not guarantee that the same questions, sections, or time patterns will appear in your actual test.</li>
                                    <li>Use this tool to practice speaking fluency, comprehension, pronunciation, and listening skills effectively.</li>
                                </ul>
                            </div>
                            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700">
                                <p className="font-semibold text-blue-300 mb-2">By proceeding, you acknowledge that:</p>
                                <ol className="list-decimal pl-6 space-y-1">
                                    <li>You have read and understood the above disclaimer.</li>
                                    <li>You are using this tool solely for preparation and practice purposes.</li>
                                    <li>The actual test experience may differ based on company-specific guidelines.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 pt-4 pb-2 bg-[#1e293b] border-t border-blue-700">
                        <button
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg text-lg transition-all duration-200"
                            onClick={() => setShowDisclaimer(false)}
                            autoFocus
                        >
                            Accept & Proceed
                        </button>
                        <button
                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg text-lg transition-all duration-200"
                            onClick={() => navigate('/dashboard')}
                        >
                            Reject
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (showReview) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white p-8 font-['Inter']">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-center">Versant Test Review</h1>

                    {/* Versant Feedback - Only show AREAS TO IMPROVE and PRACTICE SUGGESTIONS */}
                    {isLoadingFeedback ? (
                        <div className="bg-[#1e293b] rounded-lg p-6 mb-8">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
                                <div className="text-xl text-gray-300">Analyzing your speaking performance...</div>
                            </div>
                        </div>
                    ) : versantFeedback ? (
                        <div className="bg-[#1e293b] rounded-lg p-6 mb-8">
                            <h3 className="text-2xl font-semibold mb-4 text-blue-400">Feedback</h3>
                            <div className="prose prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                                    {versantFeedback.split('\n').map((line, index) => {
                                        const trimmedLine = line.trim();
                                        if (trimmedLine === 'AREAS TO IMPROVE:' || trimmedLine === 'PRACTICE SUGGESTIONS:') {
                                            return (
                                                <h4 key={index} className="text-blue-300 font-semibold mt-6 mb-3">
                                                    {trimmedLine}
                                                </h4>
                                            );
                                        }
                                        if (trimmedLine.match(/^\d+\./)) {
                                            return (
                                                <div key={index} className="flex items-start space-x-2 mb-3 ml-4">
                                                    <span className="text-blue-400">{trimmedLine.split('.')[0]}.</span>
                                                    <span className="text-gray-300">{trimmedLine.split('.').slice(1).join('.').trim()}</span>
                                                </div>
                                            );
                                        }
                                        // Only show lines under AREAS TO IMPROVE or PRACTICE SUGGESTIONS
                                        if (
                                            trimmedLine &&
                                            (versantFeedback.includes('AREAS TO IMPROVE:') || versantFeedback.includes('PRACTICE SUGGESTIONS:'))
                                        ) {
                                            // Only show lines after these headers
                                            return <p key={index} className="mb-2 text-gray-300">{trimmedLine}</p>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#1e293b] rounded-lg p-6 mb-8">
                            {/* <div className="text-center text-gray-400">
                                No feedback available. Please try again.
                            </div> */}
                        </div>
                    )}

                    {/* Individual Round Results */}
                    <div className="space-y-6">
                        {results.map((result, index) => (
                            <div key={index} className="bg-[#1e293b] rounded-lg p-6">
                                <h3 className="text-2xl font-semibold mb-4 text-blue-400">{result.roundName}</h3>
                                <div className="text-sm text-gray-400 mb-4">
                                    Completed at: {result.timestamp.toLocaleTimeString()}
                                </div>
                                <div className="space-y-4">
                                    {result.details.map((detail, idx) => (
                                        <div key={idx} className="bg-[#0f172a] rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-gray-300">Response {idx + 1}:</p>
                                                {detail.audioUrl && (
                                                    <button
                                                        onClick={() => handlePlayAudio(detail.audioUrl!)}
                                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentlyPlaying === detail.audioUrl
                                                            ? 'bg-red-600 hover:bg-red-700'
                                                            : 'bg-blue-600 hover:bg-blue-700'
                                                            } transition-colors`}
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                        <span>
                                                            {currentlyPlaying === detail.audioUrl ? 'Stop' : 'Play'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg transition-all duration-200"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setCurrentRound(0);
                                setResults([]);
                                setShowReview(false);
                                setIsTransitioning(false);
                                setCurrentlyPlaying(null);
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current = null;
                                }
                            }}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all duration-200"
                        >
                            Retake Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if all rounds are completed
    if (currentRound >= rounds.length) {
        // Stop the timer and hide VersantTimer
        if (isTestStarted) setIsTestStarted(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Log all transcriptions when all rounds are completed
        console.log('=== VERSANT TEST TRANSCRIPTIONS ===');
        results.forEach((roundResult, roundIndex) => {
            console.log(`Round ${roundIndex + 1} (${roundResult.roundName}):`);
            if (roundResult.details && roundResult.details.length > 0) {
                roundResult.details.forEach((detail, detailIndex) => {
                    console.log(`  Question ${detailIndex + 1}:`);
                    console.log(`    Text: "${detail.text}"`);
                    console.log(`    Transcription: "${detail.transcription || 'No transcription'}"`);
                });
            } else {
                console.log(`  No details available`);
            }
        });
        console.log('=== END TRANSCRIPTIONS ===');

        return (
            <div className="min-h-screen bg-[#0f172a] flex justify-center items-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">All rounds completed!</h2>
                    <Button
                        onClick={() => setShowReview(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                    >
                        View Results
                    </Button>
                </div>
            </div>
        );
    }

    // Get current round data safely
    const currentRoundData = rounds[currentRound];
    if (!currentRoundData?.component) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex justify-center items-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Error: Round not found</h2>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const RoundComponent = currentRoundData.component;

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Show upgrade dialog only if user cannot access Versant (used up free round and not premium) */}
            {showDisclaimer && subscriptionStatus && !subscriptionStatus.can_access_versant && (
                <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
                    <DialogContent className="bg-[#1e293b] text-white border-none"
                        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold text-blue-400 mb-2 text-center">
                                Versant Access Limit Reached
                            </DialogTitle>
                            <DialogDescription className="text-gray-300 text-center">
                                {subscriptionStatus.is_premium
                                    ? 'Your premium subscription has expired. Please renew to continue unlimited Versant practice.'
                                    : (subscriptionStatus.remaining_free_interviews === 0
                                        ? 'You have used your 1 free Versant round. Upgrade to premium for unlimited access.'
                                        : 'Versant rounds are available for premium users and you get 1 free attempt as a free user.')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={() => navigate('/dashboard/subscription')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                            >
                                Upgrade to Premium
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Timer */}
            {isTestStarted && <VersantTimer seconds={elapsedTime} />}

            {/* Round Progress Indicator */}
            <div className="fixed top-4 right-4 bg-[#1e293b] rounded-lg p-4 shadow-lg">
                <div className="text-white text-sm">
                    Round {currentRound + 1} of {rounds.length}: {currentRoundData.name}
                </div>
            </div>

            <RoundComponent {...currentRoundData.props} />
        </div>
    );
};

export default VersantFlow;






