import React, { useState, useEffect, useRef } from 'react';
import { Play, Mic, MicOff, Volume2, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

interface Answer {
    questionIndex: number;
    text: string;
    audioBlob: Blob;
    audioUrl: string;
    transcript?: string;
}

interface ShortAnswerQuestionProps {
    questions: string[];
    onComplete: (recordings: any) => void;
    onStart?: () => void;
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
                <div className="inline-block align-bottom bg-[#1e293b] rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-white">
                                Exit Test
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-300">
                                    Are you sure you want to exit? Your progress will be lost.
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
                            Exit Test
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-[#334155] text-base font-medium text-gray-300 hover:bg-[#3f4c6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ questions, onComplete, onStart }) => {
    const navigate = useNavigate();

    // State for questions from API
    const [questionsFromAPI, setQuestionsFromAPI] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [isProcessingRecording, setIsProcessingRecording] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(10);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [debug, setDebug] = useState('');
    const [transcriptions, setTranscriptions] = useState<{ [key: number]: string }>({});
    const elevenlabsRef = useRef<ElevenLabsClient | null>(null);

    // 1. Hardcode the list of available short answer audio filenames at the top of the component (after imports):
    const AVAILABLE_SHORT_ANSWER_FILES = [
        "SA -1.mp3",
        "SA -2.mp3",
        "SA -3.mp3",
        "SA -4.mp3",
        "SA -5.mp3",
        "SA -6.mp3",
        "SA -7.mp3",
        "SA -8.mp3",
        "SA -9.mp3",
        "SA -10.mp3",
        "SA -11.mp3",
        "SA -12.mp3",
        "SA -13.mp3",
        "SA -14.mp3",
        "SA -15.mp3",
        "SA -16.mp3",
        "SA -17.mp3",
        "SA -18.mp3",
        "SA -19.mp3",
        "SA -20.mp3"
    ];

    // 2. Add new state for selected audio files and current audio index:
    const [selectedAudioFiles, setSelectedAudioFiles] = useState<string[]>([]);
    const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);

    // 3. Add a function to shuffle and select 12 random audio files:
    function getRandomAudios(files: string[], count: number = 12) {
        const shuffled = [...files].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Only call onComplete after all answers have audio
    const handleNextQuestion = () => {
        console.log('Moving to next question...');
        if (currentAudioIndex + 1 >= selectedAudioFiles.length) {
            // Wait for answers to be updated with audio
            setTimeout(() => {
                if (answers.length === selectedAudioFiles.length && answers.every(a => a.audioBlob && a.audioUrl)) {
                    onComplete(answers);
                } else {
                    // Wait a bit more if not all audio is present
                    setTimeout(() => onComplete(answers), 300);
                }
            }, 100);
            return;
        }
        // Move to next audio
        setCurrentAudioIndex(currentAudioIndex + 1);
        setIsAudioPlaying(true);
        setCurrentQuestionIndex(-1);
        setTimeLeft(10);
    };

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await API.getShortAnswerTest();
                setQuestionsFromAPI(response.questions);
            } catch (error: any) {
                console.error('Error fetching questions:', error);
                const errorMessage = error?.response?.data?.detail || 'Failed to load questions. Please try again.';
                setError(errorMessage);

                // Check for subscription error first
                if (errorMessage.includes('premium users')) {
                    navigate('/pricing');
                    return;
                }

                // For other errors, use fallback questions
                setQuestionsFromAPI([
                    "What do you usually do in your free time?",
                    "What kind of food do you like to eat?",
                    "Describe your typical morning routine.",
                    "What is your favorite season and why?",
                    "How do you prefer to travel on vacation?",
                    "What type of movies do you enjoy watching?",
                    "What are your plans for the next weekend?",
                    "What makes you feel happy and relaxed?"
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [navigate]);


    // Debug effect to log answers changes
    useEffect(() => {
        console.log('Answers updated:', answers);
    }, [answers]);

    // Initialize ElevenLabs client
    useEffect(() => {
        const apiKey = import.meta.env.VITE_ELEVEN_LAB;
        if (apiKey) {
            elevenlabsRef.current = new ElevenLabsClient({
                apiKey: apiKey
            });
        }
    }, []);

    const speakQuestionWithElevenLabs = async (text: string, onEnd?: () => void) => {
        setIsBotSpeaking(true);
        try {
            const apiKey = import.meta.env.VITE_ELEVEN_LAB;
            const voiceId = import.meta.env.VITE_ELEVEN_LAB_VOICE_ID;
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    output_format: 'mp3_44100_128',
                }),
            });
            if (!response.ok) throw new Error('Failed to fetch audio from ElevenLabs');
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.onended = () => {
                    setIsBotSpeaking(false);
                    if (onEnd) onEnd();
                };
                audioRef.current.play();
            }
        } catch (error) {
            setIsBotSpeaking(false);
            if (onEnd) onEnd();
        }
    };

    // 4. Update startTest to select 12 random audios and start playing the first one:
    const startTest = async () => {
        try {
            if (onStart) {
                onStart();
            }
            setCurrentQuestionIndex(-1);
            setAnswers([]);
            // Select 10 random audio files
            const randomAudios = getRandomAudios(AVAILABLE_SHORT_ANSWER_FILES, 10);
            setSelectedAudioFiles(randomAudios);
            setCurrentAudioIndex(0);
            setIsAudioPlaying(true);
            setTimeLeft(10);
        } catch (error) {
            console.error('Error starting test:', error);
            setError('Failed to start test. Please try again.');
        }
    };

    const speakQuestionAndStartRecording = async (questionIndex: number) => {
        console.log('Speaking question and starting recording for index:', questionIndex);
        setCurrentQuestionIndex(questionIndex);
        setTimeLeft(10);
        setIsRecording(false);
        setIsBotSpeaking(true);

        await speakQuestionWithElevenLabs(questionsFromAPI[questionIndex], () => startQuestionRecording(questionIndex));
    };

    const startQuestionRecording = async (questionIndex: number) => {
        console.log('Starting recording for question...');
        try {
            await startRecording(questionIndex);
            setTimeLeft(10);
        } catch (error) {
            console.error('Failed to start recording:', error);
            setDebug(`Failed to start recording: ${error}`);
        }
    };

    // Timer effect - only runs when recording is active
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft > 0 && isRecording && !isReviewMode && !isProcessingRecording) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    if (newTime === 0) {
                        // Time's up, automatically move to next question
                        setTimeout(() => handleNextQuestion(), 100);
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, isRecording, isReviewMode, isProcessingRecording]);

    // 5. Add useEffect to play the current audio when currentAudioIndex changes:
    useEffect(() => {
        if (isAudioPlaying && currentAudioIndex >= 0 && currentAudioIndex < selectedAudioFiles.length) {
            const audioPath = `/speechmaa/shortAnswer/${selectedAudioFiles[currentAudioIndex]}`;
            if (audioRef.current) {
                audioRef.current.src = audioPath;
                audioRef.current.onended = () => {
                    setIsAudioPlaying(false);
                    setCurrentQuestionIndex(currentAudioIndex); // Now show the recording UI for this index
                    startQuestionRecording(currentAudioIndex);
                };
                audioRef.current.play();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAudioIndex, isAudioPlaying]);

    const initializeRecorder = async (questionIndex: number, answerText: string) => {
        try {
            console.log('Initializing recorder for question:', questionIndex);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('MediaRecorder stopped for question:', questionIndex);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Add answer to answers array only after audio is available
                setAnswers(prev => {
                    const newAnswers = prev.filter(a => a.questionIndex !== questionIndex);
                    return [...newAnswers, {
                        questionIndex,
                        text: answerText,
                        audioBlob,
                        audioUrl
                    }].sort((a, b) => a.questionIndex - b.questionIndex);
                });

                // Clean up stream
                stream.getTracks().forEach(track => track.stop());

                // Move to next question
                handleNextQuestion();
            };

            return mediaRecorder;
        } catch (error) {
            console.error('Error initializing recorder:', error);
            setDebug(`Error initializing recorder: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    };

    const startRecording = async (questionIndex: number) => {
        try {
            console.log('Starting recording for question:', questionIndex);
            setCurrentQuestionIndex(questionIndex);
            const answerText = currentAnswer;
            const mediaRecorder = await initializeRecorder(questionIndex, answerText);
            mediaRecorder.start();
            setIsRecording(true);
            console.log('Recording started successfully');
        } catch (error: any) {
            console.error('Error starting recording:', error);
            setDebug(`Error starting recording: ${error?.message || 'Unknown error'}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setDebug('Recording stopped');
        }
    };

    const handleSubmit = () => {
        // Implement the logic to submit answers
        console.log('Submitting answers:', answers);
        navigate('/dashboard');
    };

    const handleRetake = () => {
        // Clean up existing recordings
        answers.forEach(answer => {
            if (answer.audioUrl) {
                URL.revokeObjectURL(answer.audioUrl);
            }
        });

        setAnswers([]);
        setCurrentQuestionIndex(-1);
        setIsReviewMode(false);
        setIsBotSpeaking(false);
        setIsProcessingRecording(false);
        setTimeLeft(10);
        setDebug('');
    };

    // Update the UI to show transcription
    const renderRecordingStatus = () => (
        <div className="flex items-center justify-center gap-2">
            {isRecording ? (
                <>
                    <Mic className="w-6 h-6 text-green-400 animate-pulse" />
                    <span className="text-green-400">Recording your answer...</span>
                </>
            ) : (
                <>
                    <MicOff className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-400">Waiting to record...</span>
                </>
            )}
            {transcriptions[currentQuestionIndex] && (
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Your answer:</p>
                    <p className="text-white">{transcriptions[currentQuestionIndex]}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8 font-['Inter']">
            {/* Debug info */}
            {debug && (
                <div className="fixed top-4 left-4 bg-red-500/20 text-red-400 p-2 rounded">
                    {debug}
                </div>
            )}

            {/* Exit Button */}
            <button
                onClick={() => setShowExitConfirmation(true)}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            <ConfirmationModal
                isOpen={showExitConfirmation}
                onClose={() => setShowExitConfirmation(false)}
                onConfirm={() => navigate('/dashboard')}
            />

            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Round 5-Short Answer Questions</h1>
                <p className="text-lg text-gray-200">
                    {currentQuestionIndex === -1 && !isAudioPlaying
                        ? "Instructions: You'll hear questions about everyday topics. Answer naturally in complete sentences."
                        : "Instructions: Listen to the question and answer in complete sentences."}
                </p>

                {/* Progress Bar */}
                {(currentQuestionIndex >= 0 || isAudioPlaying) && (
                    <div className="mt-6 max-w-md mx-auto">
                        <div className="text-sm text-gray-400 mb-2">
                            Progress: {isAudioPlaying ? currentAudioIndex + 1 : currentQuestionIndex + 1} of {selectedAudioFiles.length} questions
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((isAudioPlaying ? currentAudioIndex + 1 : currentQuestionIndex + 1) / selectedAudioFiles.length) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-full max-w-3xl">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg text-blue-400">Loading questions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                ) : currentQuestionIndex === -1 && !isAudioPlaying ? (
                    <button
                        onClick={startTest}
                        className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Play className="w-6 h-6" />
                        Start Test
                    </button>
                ) : (
                    <div className="space-y-8">
                        {/* Audio Playing State */}
                        {isAudioPlaying && currentAudioIndex >= 0 && (
                            <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-[#334155]">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                        <Volume2 className="w-16 h-16 text-blue-500 animate-pulse" />
                                    </div>
                                    <p className="text-2xl text-center text-blue-400 font-semibold">
                                        Question {currentAudioIndex + 1} of {selectedAudioFiles.length}
                                    </p>
                                    <p className="text-lg text-gray-400 text-center">Playing question audio...</p>
                                    <p className="text-sm text-gray-500 text-center">Please listen carefully to the question.</p>
                                </div>
                            </div>
                        )}

                        {/* Question Display - Only show when not playing audio */}
                        {!isAudioPlaying && currentQuestionIndex >= 0 && (
                            <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-[#334155]">
                                <p className="text-2xl text-center mb-6">
                                    Please answer the question after listening to the audio.
                                </p>
                                {isBotSpeaking && (
                                    <div className="flex items-center justify-center gap-2 text-blue-400">
                                        <Volume2 className="w-6 h-6 animate-pulse" />
                                        <span>Listening to question...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timer Circle - Only show when recording */}
                        {!isAudioPlaying && currentQuestionIndex >= 0 && (
                            <div className="flex justify-center">
                                <div className="relative w-32 h-32">
                                    <svg className="transform -rotate-90 w-full h-full">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="45"
                                            stroke="#334155"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        {isRecording && (
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="45"
                                                stroke="url(#gradient)"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={2 * Math.PI * 45}
                                                strokeDashoffset={2 * Math.PI * 45 * (1 - timeLeft / 10)}
                                                className="transition-all duration-1000 ease-linear"
                                            />
                                        )}
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold">{timeLeft}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recording Status with Transcription - Only show when recording */}
                        {!isAudioPlaying && currentQuestionIndex >= 0 && renderRecordingStatus()}

                        {/* Next Button - Only show when not playing audio and not recording */}
                        {!isAudioPlaying && !isBotSpeaking && !isRecording && currentQuestionIndex >= 0 && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
                                >
                                    <span className="flex items-center gap-2">
                                        <ChevronRight className="w-6 h-6" />
                                        Next Question
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Indicator */}
            {(currentQuestionIndex >= 0 || isAudioPlaying) && (
                <div className="mt-8 text-gray-400">
                    {isAudioPlaying ? (
                        <span>Question {currentAudioIndex + 1} of {selectedAudioFiles.length}</span>
                    ) : (
                        <span>Question {currentQuestionIndex + 1} of {selectedAudioFiles.length}</span>
                    )}
                </div>
            )}

            <audio ref={audioRef} hidden />
        </div>
    );
};

export default ShortAnswerQuestion;






