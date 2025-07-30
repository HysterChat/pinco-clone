import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Play, ChevronRight, BarChart3, XCircle, AlertTriangle, Clock, Camera, Video } from 'lucide-react';
import API, { InterviewAnalysisResponse } from '../../../services/api';
import InterviewFeedback from './InterviewFeedback';
import styles from './InterviewSession.module.css';

interface Question {
    text: string;
    category: string;
}


interface InterviewState {
    currentQuestionIndex: number;
    questions: Question[];
    answers: { [key: number]: string };
    transcriptions: { [key: number]: string }; // Add transcriptions storage
    isListening: boolean;
    isSpeaking: boolean;
    isInterviewComplete: boolean;
    feedback?: InterviewAnalysisResponse;
}

interface SpeechRecognitionResult extends EventTarget {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface ExtendedWindow extends Window {
    webkitSpeechRecognition: {
        new(): SpeechRecognition;
    };
}

type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';

declare const window: ExtendedWindow;

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;

    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

    start(): void;
    stop(): void;
    abort(): void;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                End Interview
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to end the interview? This will close the window and stop the recording. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            End Interview
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Add DisclaimerModal component
const DisclaimerModal = ({ isOpen, onClose, onAccept }: { isOpen: boolean; onClose: () => void; onAccept: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">eval8 ai Interview Disclaimer</h2>
                <div className="space-y-4 text-gray-600">
                    <p>
                        To receive performance feedback from eval8 ai, you must complete the entire interview process without interruption.
                    </p>
                    <p>
                        If you choose to exit or leave the interview midway, eval8 ai will not be able to generate feedback, as our evaluation system requires full completion of all interview sections to provide accurate and actionable insights.
                    </p>
                    <p>
                        Please ensure you finish the interview in one sitting for the best experience and complete feedback.
                    </p>
                </div>
                <div className="mt-8 flex gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                    >
                        I Understand, Start Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

const InterviewSession: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isSpeakingRef = useRef<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null); // For ElevenLabs TTS audio

    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');
    const [interviewState, setInterviewState] = useState<InterviewState>({
        currentQuestionIndex: -1,
        questions: [],
        answers: {},
        transcriptions: {}, // Add transcriptions to initial state
        isListening: false,
        isSpeaking: false,
        isInterviewComplete: false
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showEndConfirmation, setShowEndConfirmation] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    useEffect(() => {
        // Get token from URL parameters and store it
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
        }

        // Initialize questions from localStorage
        const storedQuestions = localStorage.getItem('currentInterviewQuestions');
        const interviewDetails = localStorage.getItem('currentInterviewDetails');

        if (storedQuestions && interviewDetails) {
            const parsedQuestions = JSON.parse(storedQuestions).map((q: string) => {
                const match = q.match(/\[(.*?)\](.*)/);
                return {
                    category: match ? match[1].trim() : 'General',
                    text: match ? match[2].trim().replace(/\s*\([^)]*\)\s*$/, '') : q.trim().replace(/\s*\([^)]*\)\s*$/, '')
                };
            });

            const details = JSON.parse(interviewDetails);

            // Store session data
            localStorage.setItem('currentInterviewSession', JSON.stringify({
                id: details.id,
                job_role: details.job_role,
                interview_focus: details.interview_focus,
                difficulty_level: details.difficulty_level
            }));

            setInterviewState(prev => ({
                ...prev,
                questions: parsedQuestions
            }));
            console.log('Loaded interview details:', details);
        }

        // Initialize speech synthesis
        synthRef.current = window.speechSynthesis;
        utteranceRef.current = new SpeechSynthesisUtterance();
        utteranceRef.current.rate = 0.9;
        utteranceRef.current.pitch = 1;
        utteranceRef.current.volume = 1;

        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onresult = handleSpeechResult;
            recognition.onerror = handleSpeechError;
            recognition.onend = handleSpeechEnd;
        } else {
            setError('Speech recognition is not supported in this browser.');
        }

        return () => {
            stopRecognition();
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const initializeCamera = async () => {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: true
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Add event listener to ensure video plays after loading
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(e => console.error('Error playing video:', e));
                };
            }
            setError(null);
        } catch (err) {
            console.error('Camera initialization error:', err);
            setError('Failed to access camera or microphone. Please check your device permissions.');
        }
    };

    const handleSpeechResult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            // Update the answer and transcription for the current question
            setInterviewState(prev => {
                const newAnswers = {
                    ...prev.answers,
                    [prev.currentQuestionIndex]: prev.answers[prev.currentQuestionIndex]
                        ? prev.answers[prev.currentQuestionIndex] + ' ' + finalTranscript.trim()
                        : finalTranscript.trim()
                };

                // Store the complete transcription for this question
                const newTranscriptions = {
                    ...prev.transcriptions,
                    [prev.currentQuestionIndex]: prev.transcriptions[prev.currentQuestionIndex]
                        ? prev.transcriptions[prev.currentQuestionIndex] + ' ' + finalTranscript.trim()
                        : finalTranscript.trim()
                };

                console.log('Updated answers:', newAnswers);
                console.log('Updated transcriptions:', newTranscriptions);
                console.log('Current question index:', prev.currentQuestionIndex);
                console.log('New answer for current question:', newAnswers[prev.currentQuestionIndex]);
                console.log('New transcription for current question:', newTranscriptions[prev.currentQuestionIndex]);

                return {
                    ...prev,
                    answers: newAnswers,
                    transcriptions: newTranscriptions
                };
            });
            setCurrentInterimTranscript('');
        } else {
            setCurrentInterimTranscript(interimTranscript);
        }
    };

    const handleSpeechError = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            setStatusMessage('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
            setError('Microphone not accessible.');
        } else if (event.error === 'not-allowed') {
            setError('Microphone permission denied.');
        }
        stopListening();
    };

    const handleSpeechEnd = () => {
        console.log('Speech recognition ended');
        isSpeakingRef.current = false;
        if (interviewState.isListening) {
            console.log('Restarting speech recognition');
            startListening(); // Restart if we're still supposed to be listening
        }
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setInterviewState(prev => ({ ...prev, isListening: true }));
                setStatusMessage('Listening... Speak now!');
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                setInterviewState(prev => ({ ...prev, isListening: false }));
                setStatusMessage('');
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
        }
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
        }
    };

    const speakQuestion = async (question: string) => {
        return new Promise<void>((resolve) => {
            if (synthRef.current && utteranceRef.current) {
                utteranceRef.current.text = question;
                utteranceRef.current.onend = () => {
                    setInterviewState(prev => ({ ...prev, isSpeaking: false }));
                    resolve();
                };
                setInterviewState(prev => ({ ...prev, isSpeaking: true }));
                synthRef.current.speak(utteranceRef.current);
            } else {
                resolve();
            }
        });
    };

    const startTimer = () => {
        setElapsedTime(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startInterview = async () => {
        try {
            // Show disclaimer first
            setShowDisclaimer(true);
        } catch (err) {
            console.error('Failed to start interview:', err);
            setError('Failed to start the interview. Please try again.');
        }
    };

    // Add function to handle actual interview start
    const handleStartInterview = async () => {
        try {
            // Initialize camera directly
            await initializeCamera();

            if (interviewState.questions.length === 0) {
                setError('No questions available for the interview.');
                return;
            }

            startTimer();

            setInterviewState(prev => ({
                ...prev,
                currentQuestionIndex: 0,
                isInterviewComplete: false
            }));

            await speakQuestionWithElevenLabs(interviewState.questions[0].text);
            await new Promise(resolve => setTimeout(resolve, 2000));
            startListening();
        } catch (err) {
            console.error('Failed to start interview:', err);
            setError('Failed to access camera or microphone. Please check your device permissions.');
        }
    };

    const handleNextQuestion = async () => {
        const nextIndex = interviewState.currentQuestionIndex + 1;

        // Check if this was the last question
        if (nextIndex >= interviewState.questions.length) {
            // Stop recording and mark interview as complete
            stopListening();
            setInterviewState(prev => ({
                ...prev,
                isInterviewComplete: true,
                currentQuestionIndex: nextIndex - 1 // Keep the last question visible
            }));
            setStatusMessage('Interview Complete! Click "Generate Feedback" to get your analysis.');

            // Log completion data
            console.log('Interview Results:');
            interviewState.questions.forEach((question, index) => {
                console.log(`Question ${index + 1}: ${question.text}`);
                console.log(`Answer: ${interviewState.answers[index] || 'No answer provided'}`);
            });
            return;
        }

        // Handle next question
        stopListening();
        setInterviewState(prev => ({
            ...prev,
            currentQuestionIndex: nextIndex
        }));

        // Add a small delay before speaking the next question
        await new Promise(resolve => setTimeout(resolve, 1000));
        await speakQuestionWithElevenLabs(interviewState.questions[nextIndex].text);
        // Add delay after TTS finishes to prevent picking up the question
        await new Promise(resolve => setTimeout(resolve, 2000));
        startListening();
    };

    const generateFeedback = async () => {
        setIsAnalyzing(true);
        setError(null); // Clear any previous errors
        try {
            // First, check if the server is reachable
            try {
                await API.healthCheck();
                console.log('Server is reachable');
            } catch (healthError) {
                console.error('Server health check failed:', healthError);
                throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
            }

            // Get interview details from localStorage
            const sessionData = JSON.parse(localStorage.getItem('currentInterviewSession') || '{}');
            const interviewDetails = JSON.parse(localStorage.getItem('currentInterviewDetails') || '{}');
            console.log('Session data:', sessionData);
            console.log('Interview details:', interviewDetails);

            const interviewId = interviewDetails.id || sessionData.id;
            if (!interviewId) {
                throw new Error('No interview ID found. Please try again.');
            }

            // Prepare the analysis request
            const analysisRequest = {
                responses: interviewState.questions.map((question, index) => ({
                    question: question.text,
                    answer: interviewState.answers[index] || 'No answer provided',
                    transcription: interviewState.transcriptions[index] || 'No transcription available' // Add transcription
                })),
                job_role: interviewDetails.job_role || sessionData.job_role || interviewDetails.sub_job_category || sessionData.sub_job_category || '',
                interview_focus: interviewDetails.interview_focus || sessionData.interview_focus || [],
                difficulty_level: interviewDetails.difficulty_level || sessionData.difficulty_level || ''
            };
            console.log('Sending analysis request:', analysisRequest);

            // Debug: Log each response individually
            analysisRequest.responses.forEach((resp, idx) => {
                console.log(`Response ${idx + 1}:`, {
                    question: resp.question,
                    answer: resp.answer,
                    answerLength: resp.answer.length
                });
            });

            // Send analysis request
            const feedback = await API.analyzeInterview(analysisRequest);
            console.log('Received feedback:', feedback);

            if (!feedback) {
                throw new Error('No feedback received from analysis service');
            }

            // Update state with feedback immediately
            setInterviewState(prev => ({
                ...prev,
                feedback
            }));
            setStatusMessage('Feedback generated! Review your performance below.');

            // Try to save the feedback in the background
            try {
                const feedbackData = {
                    interview_id: interviewId,
                    overall_score: feedback.summary.overall_score,
                    analysis: feedback.analysis,
                    summary: feedback.summary,
                    metadata: {
                        ...feedback.metadata,
                        job_category: interviewDetails.job_category || sessionData.job_category,
                        sub_job_category: interviewDetails.sub_job_category || sessionData.sub_job_category,
                        duration: interviewDetails.duration || sessionData.duration
                    },
                    responses: analysisRequest.responses, // This now includes transcriptions
                    score: feedback.summary.overall_score  // Include the score explicitly
                };

                console.log('Saving feedback data:', feedbackData);
                const savedFeedback = await API.saveFeedback(feedbackData);
                console.log('Saved feedback response:', savedFeedback);
            } catch (saveError) {
                console.error('Error saving feedback:', saveError);
                // Don't throw the error since we already have the feedback displayed
            }
        } catch (error: any) {
            console.error('Error in feedback generation:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to analyze interview responses';
            setError(errorMessage);
            setStatusMessage('Failed to generate feedback. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleEndInterview = async () => {
        stopTimer(); // Stop timer when interview ends
        setShowEndConfirmation(true);
    };

    const confirmEndInterview = () => {
        stopListening();
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
        window.close();
    };

    const handleCloseFeedback = () => {
        setInterviewState(prev => ({
            ...prev,
            feedback: undefined
        }));
    };

    // --- ElevenLabs TTS Integration (Optional) ---
    // Usage: Call speakQuestionWithElevenLabs(question) instead of speakQuestion to use ElevenLabs TTS
    const speakQuestionWithElevenLabs = async (question: string) => {
        setInterviewState(prev => ({ ...prev, isSpeaking: true }));
        try {
            // ElevenLabs API endpoint
            const apiKey = import.meta.env.VITE_ELEVEN_LAB;

            const voiceId = import.meta.env.VITE_ELEVEN_LAB_VOICE_ID;// You can change this to your preferred voice
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: question,
                    model_id: 'eleven_multilingual_v2',
                    output_format: 'mp3_44100_128',
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch audio from ElevenLabs');
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setInterviewState(prev => ({ ...prev, isSpeaking: false }));
                };
            }
        } catch (error) {
            setInterviewState(prev => ({ ...prev, isSpeaking: false }));
            // Optionally handle error (show message, etc.)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50">
            <DisclaimerModal
                isOpen={showDisclaimer}
                onClose={() => setShowDisclaimer(false)}
                onAccept={() => {
                    setShowDisclaimer(false);
                    handleStartInterview();
                }}
            />
            <ConfirmationModal
                isOpen={showEndConfirmation}
                onClose={() => setShowEndConfirmation(false)}
                onConfirm={confirmEndInterview}
            />
            {isAnalyzing ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700">Analyzing your interview responses...</p>
                </div>
            ) : interviewState.feedback ? (
                <InterviewFeedback feedback={interviewState.feedback} onClose={handleCloseFeedback} />
            ) : (
                <div className="container mx-auto px-4 py-8 relative">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden border border-gray-200">
                        {/* Left: Bot Area */}
                        <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                            {/* Timer */}
                            {interviewState.currentQuestionIndex >= 0 && !interviewState.isInterviewComplete && (
                                <div className="mb-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    <span className="font-mono text-lg font-semibold text-indigo-600">
                                        {formatTime(elapsedTime)}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col items-center">
                                <div className="bg-white rounded-full shadow-lg p-3 mb-3 border-4 border-indigo-200 flex items-center justify-center">
                                    {interviewState.isListening ? (
                                        <Mic className="w-16 h-16 text-red-600 animate-pulse" />
                                    ) : (
                                        <MicOff className="w-16 h-16 text-indigo-600" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-indigo-700">eval8 ai Bot</h2>
                                <p className="text-indigo-500 text-center text-base font-medium mb-4">
                                    {statusMessage || (!interviewState.currentQuestionIndex ? 'Ready to start your interview?' : 'Interview in progress...')}
                                </p>
                                {interviewState.currentQuestionIndex === -1 && !interviewState.isInterviewComplete && (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={startInterview}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 flex items-center"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Start Interview
                                        </button>
                                        <button
                                            onClick={() => {
                                                startListening();
                                                setStatusMessage('Testing speech recognition... Say something!');
                                                setTimeout(() => {
                                                    stopListening();
                                                    setStatusMessage('Speech recognition test complete.');
                                                }, 5000);
                                            }}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 flex items-center text-sm"
                                        >
                                            <Mic className="w-4 h-4 mr-2" />
                                            Test Microphone
                                        </button>
                                    </div>
                                )}
                                {interviewState.isInterviewComplete && !interviewState.feedback && (
                                    <div className="flex flex-col items-center gap-3">
                                        <p className="text-green-600 font-medium">Interview Complete!</p>
                                        <button
                                            onClick={generateFeedback}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 flex items-center"
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Generate Feedback
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle: User Video */}
                        <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
                            <h2 className="text-lg font-bold mb-3 text-gray-800">Your Camera</h2>
                            {error ? (
                                <div className="text-red-500 mb-3 text-center p-3 rounded-md bg-red-50 text-sm">{error}</div>
                            ) : (
                                <div className="relative w-full aspect-video rounded-lg shadow-lg overflow-hidden mb-3">
                                    {/* Background Video */}
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ filter: 'brightness(0.7)' }}
                                    >
                                        <source src="/assets/office-background.mp4" type="video/mp4" />
                                    </video>
                                    {/* User Video */}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="relative z-10 w-full h-full object-cover bg-transparent"
                                        style={{ transform: 'rotateY(180deg)' }}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col gap-2 w-full max-w-sm">
                                {/* Only show recording buttons when interview is in progress */}
                                {interviewState.currentQuestionIndex >= 0 && !interviewState.isInterviewComplete && (
                                    <button
                                        onClick={() => interviewState.isListening ? stopListening() : startListening()}
                                        className={`px-3 py-2 ${interviewState.isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg shadow flex items-center justify-center`}
                                        disabled={interviewState.isInterviewComplete}
                                    >
                                        {interviewState.isListening ? (
                                            <>
                                                <MicOff className="w-4 h-4 mr-2" />
                                                Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-4 h-4 mr-2" />
                                                Start Recording
                                            </>
                                        )}
                                    </button>
                                )}
                                {/* Repeat/Next/End buttons only when interview is in progress */}
                                {interviewState.currentQuestionIndex >= 0 && !interviewState.isInterviewComplete && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <button
                                            onClick={() => speakQuestionWithElevenLabs(interviewState.questions[interviewState.currentQuestionIndex].text)}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center justify-center"
                                        >
                                            Repeat Question
                                            <Play className="w-4 h-4 ml-2" />
                                        </button>
                                        {interviewState.answers[interviewState.currentQuestionIndex] && (
                                            <button
                                                onClick={handleNextQuestion}
                                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow flex items-center justify-center"
                                            >
                                                Next Question
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* End Interview button only when interview is in progress */}
                                {interviewState.currentQuestionIndex >= 0 && !interviewState.isInterviewComplete && (
                                    <button
                                        onClick={handleEndInterview}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow flex items-center justify-center"
                                    >
                                        End Interview
                                        <XCircle className="w-4 h-4 ml-2" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right: Transcribed Text */}
                        <div className="w-full md:w-1/3 flex flex-col p-4">
                            <h2 className="text-lg font-bold mb-3 text-gray-800">
                                {interviewState.isInterviewComplete ? 'Interview Complete' : 'Current Question'}
                            </h2>
                            <div className="flex-1 bg-white rounded-lg shadow-md p-4 min-h-[400px] max-h-[400px] overflow-hidden">
                                {/* Current Question or Completion Message */}
                                {interviewState.isInterviewComplete ? (
                                    <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
                                        <h3 className="text-green-600 font-semibold mb-2">Interview Complete!</h3>
                                        <p className="text-green-700 text-sm">
                                            All questions have been answered successfully.
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Click the "Generate Feedback" button to get your analysis.
                                        </p>
                                    </div>
                                ) : interviewState.currentQuestionIndex >= 0 &&
                                    interviewState.currentQuestionIndex < interviewState.questions.length ? (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                Question {interviewState.currentQuestionIndex + 1}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {interviewState.currentQuestionIndex + 1} of {interviewState.questions.length}
                                            </span>
                                        </div>
                                        <div className="mb-2 border-b pb-2">
                                            <p className="text-gray-900 font-medium text-sm">
                                                {interviewState.questions[interviewState.currentQuestionIndex].text}
                                            </p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                                            {interviewState.answers[interviewState.currentQuestionIndex] && (
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                                                    <p className="text-gray-800 text-sm">
                                                        {interviewState.answers[interviewState.currentQuestionIndex]}
                                                    </p>
                                                </div>
                                            )}
                                            {currentInterimTranscript && (
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 animate-pulse">
                                                    <p className="text-gray-600 italic text-sm">
                                                        {currentInterimTranscript}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-3">
                                        <p className="text-gray-500 italic text-sm">
                                            Click "Start Interview" to begin...
                                        </p>
                                    </div>
                                )}
                            </div>
                            {statusMessage && (
                                <div className="mt-3 p-2 rounded-lg bg-indigo-50 shadow-sm">
                                    <p className="text-sm text-center font-medium text-indigo-600">
                                        {statusMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ElevenLabs TTS audio element (hidden) */}
                    <audio ref={audioRef} hidden />
                </div>
            )}
        </div>
    );
};

export default InterviewSession;






