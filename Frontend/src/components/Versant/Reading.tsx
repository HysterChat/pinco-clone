import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, ChevronRight, X, AlertTriangle, Pause, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { useToast } from "@/components/ui/use-toast";

interface Recording {
    sentenceIndex: number;
    audioBlob: Blob;
    audioUrl?: string;
    transcript?: string;
}

interface ReadingProps {
    onComplete: (recordings: Recording[]) => void;
    onStart?: () => void;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText
}) => {
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
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-300">
                                    {message}
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
                            {confirmText}
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

const Reading: React.FC<ReadingProps> = ({ onComplete, onStart }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    const [timeLeft, setTimeLeft] = useState(6);
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [isPlaying, setIsPlaying] = useState<number | null>(null);
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);
    const [isTestComplete, setIsTestComplete] = useState(false);
    const [debug, setDebug] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [sentences, setSentences] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [transcriptions, setTranscriptions] = useState<{ [key: number]: string }>({});

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const elevenlabsRef = useRef<ElevenLabsClient | null>(null);

    useEffect(() => {
        const fetchSentences = async () => {
            try {
                setIsLoading(true);
                // Show initial loading toast
                toast({
                    title: "Generating Test",
                    description: "Bot is preparing your reading test...",
                });

                const response = await api.getReadingTest();
                setSentences(response.sentences);
                setIsLoading(false);

                // Show success toast
                toast({
                    title: "Test Ready",
                    description: "Your reading test has been prepared successfully.",
                });
            } catch (error: any) {
                console.error('Error fetching sentences:', error);
                const errorMessage = error?.response?.data?.detail || 'Error fetching sentences. Please try again.';
                setDebug(errorMessage);
                setIsLoading(false);

                // Check for subscription error first
                if (errorMessage.includes('premium users')) {
                    toast({
                        variant: "destructive",
                        title: "Premium Feature",
                        description: "Versant rounds are only available for premium users. Please upgrade to access this feature.",
                    });
                    // Navigate to pricing page after 2 seconds
                    setTimeout(() => {
                        navigate('/pricing');
                    }, 2000);
                    return;
                }

                // Handle other errors
                if (errorMessage.includes('Failed to generate reading test') ||
                    errorMessage.includes('Failed to generate enough valid sentences')) {
                    toast({
                        title: "Regenerating Test",
                        description: "Bot is trying to generate a better test for you...",
                    });
                    console.log('Detected sentence generation error, refreshing page in 2 seconds...');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    // Show error toast for other errors
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: errorMessage,
                    });
                }
            }
        };

        fetchSentences();
    }, [toast, navigate]);

    // Debug logging for recordings state
    useEffect(() => {
        console.log('Current recordings state:', recordings);
        console.log('Number of recordings:', recordings.length);
        console.log('Recording indices:', recordings.map(r => r.sentenceIndex));
    }, [recordings]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRecording) {
            console.log('Time up - stopping recording');
            handleNextSentence();
        }
        return () => clearInterval(timer);
    }, [isRecording, timeLeft]);

    useEffect(() => {
        // Start recording when test is initialized
        if (isInitialized && currentSentenceIndex === 0) {
            startRecording();
        }
    }, [isInitialized]);

    useEffect(() => {
        // Cleanup audio context and recordings when component unmounts
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            recordings.forEach(recording => {
                if (recording.audioUrl) {
                    URL.revokeObjectURL(recording.audioUrl);
                }
            });
        };
    }, []);

    // Initialize ElevenLabs client
    useEffect(() => {
        const apiKey = import.meta.env.VITE_ELEVEN_LAB;
        if (apiKey) {
            elevenlabsRef.current = new ElevenLabsClient({
                apiKey: apiKey
            });
        }
    }, []);

    const initializeRecorder = async (recordingIndex: number) => {
        try {
            console.log('Initializing recorder for index:', recordingIndex);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    sampleRate: 44100,
                    sampleSize: 16
                }
            });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                console.log('Data available event triggered for index:', recordingIndex);
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('MediaRecorder stopped, processing recording for index:', recordingIndex);

                // Wait for audio chunks to be fully processed
                await new Promise(resolve => setTimeout(resolve, 500));

                if (audioChunksRef.current.length === 0) {
                    console.error('No audio data recorded');
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                console.log('Audio blob created:', {
                    size: audioBlob.size,
                    type: audioBlob.type,
                    chunks: audioChunksRef.current.length
                });

                // Verify audio blob is valid
                if (audioBlob.size < 1000) {
                    console.error('Audio recording too small, might be invalid');
                    return;
                }

                const audioUrl = URL.createObjectURL(audioBlob);

                // Get transcription if ElevenLabs client is available
                try {
                    if (elevenlabsRef.current) {
                        console.log('Starting transcription with ElevenLabs...');

                        // Convert webm to wav for better compatibility
                        const audioContext = new AudioContext();
                        const arrayBuffer = await audioBlob.arrayBuffer();
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                        // Create WAV blob
                        const wavBlob = await new Promise(resolve => {
                            const numberOfChannels = 1;
                            const length = audioBuffer.length;
                            const sampleRate = audioBuffer.sampleRate;
                            const wavBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
                            const channelData = audioBuffer.getChannelData(0);
                            wavBuffer.getChannelData(0).set(channelData);

                            const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
                            const source = offlineContext.createBufferSource();
                            source.buffer = wavBuffer;
                            source.connect(offlineContext.destination);
                            source.start();

                            offlineContext.startRendering().then(renderedBuffer => {
                                const wavArrayBuffer = exportWAV(renderedBuffer);
                                const wav = new Blob([wavArrayBuffer], { type: 'audio/wav' });
                                resolve(wav);
                            });
                        });

                        console.log('Converted to WAV, sending to ElevenLabs...');
                        const transcription = await elevenlabsRef.current.speechToText.convert({
                            file: wavBlob,
                            modelId: "scribe_v1",
                            tagAudioEvents: true,
                            languageCode: "eng",
                            diarize: true,
                        });

                        console.log('Raw transcription response:', transcription);
                        console.log('Transcription text:', transcription.text);
                        console.log('Transcription for index', recordingIndex, ':', transcription);
                        setTranscriptions(prev => ({
                            ...prev,
                            [recordingIndex]: transcription.text
                        }));
                    } else {
                        console.error('ElevenLabs client not initialized');
                        console.log('ElevenLabs API Key:', import.meta.env.VITE_ELEVEN_LAB ? 'Present' : 'Missing');
                    }
                } catch (error) {
                    console.error('Detailed transcription error:', error);
                    if (error instanceof Error) {
                        console.error('Error name:', error.name);
                        console.error('Error message:', error.message);
                        console.error('Error stack:', error.stack);
                    }
                }

                setRecordings(prev => {
                    // Create new recording object
                    const newRecording = {
                        sentenceIndex: recordingIndex,
                        audioBlob,
                        audioUrl,
                        transcript: transcriptions[recordingIndex] // Add transcript to recording
                    };

                    // Remove any existing recording with the same index
                    const filteredRecordings = prev.filter(r => r.sentenceIndex !== recordingIndex);

                    // Add new recording and sort by index
                    const newRecordings = [...filteredRecordings, newRecording]
                        .sort((a, b) => a.sentenceIndex - b.sentenceIndex);

                    console.log('Updated recordings array:', newRecordings, 'Indices:', newRecordings.map(r => r.sentenceIndex));
                    return newRecordings;
                });

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.onstart = () => {
                console.log('MediaRecorder started for index:', recordingIndex);
                setIsRecording(true);
                audioChunksRef.current = [];
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setDebug(`MediaRecorder error: ${event.type}`);
            };

            return mediaRecorder;
        } catch (error) {
            console.error('Error initializing recorder:', error);
            setDebug(`Error initializing recorder: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    };

    const startTest = async () => {
        try {
            if (onStart) {
                onStart();
            }
            console.log('Starting test...');
            setRecordings([]); // Clear any existing recordings
            setCurrentSentenceIndex(0);
            setTimeLeft(6);
            // Start recording immediately for the first sentence
            const mediaRecorder = await initializeRecorder(0);
            mediaRecorder.start(1000);
        } catch (error) {
            console.error('Error in startTest:', error);
            setDebug(`Error in startTest: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const startRecording = async () => {
        try {
            console.log('Starting new recording for index:', currentSentenceIndex);
            const mediaRecorder = await initializeRecorder(currentSentenceIndex);
            mediaRecorder.start(1000);
        } catch (error) {
            console.error('Error in startRecording:', error);
            setDebug(`Error in startRecording: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const stopRecording = () => {
        console.log('Stopping recording for index:', currentSentenceIndex);
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleNextSentence = () => {
        const currentIndex = currentSentenceIndex;
        console.log('Handling next sentence, current index:', currentIndex);

        if (isRecording) {
            stopRecording();
        }

        // Use setTimeout to ensure the current recording is processed
        setTimeout(async () => {
            if (currentIndex + 1 >= sentences.length) {
                console.log('Test complete');
                // Instead of showing feedback, directly call onComplete and clean up
                if (onComplete) {
                    onComplete(recordings);
                }
                // Clean up resources
                if (mediaRecorderRef.current?.stream) {
                    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                }
                recordings.forEach(recording => {
                    if (recording.audioUrl) {
                        URL.revokeObjectURL(recording.audioUrl);
                    }
                });
            } else {
                const nextIndex = currentIndex + 1;
                console.log('Moving to next sentence. Current:', currentIndex, 'Next:', nextIndex);
                setCurrentSentenceIndex(nextIndex);
                setTimeLeft(6);

                // Start recording with explicit next index
                try {
                    console.log('Starting recording for next index:', nextIndex);
                    const mediaRecorder = await initializeRecorder(nextIndex);
                    mediaRecorder.start(1000);
                } catch (error) {
                    console.error('Error starting next recording:', error);
                    setDebug(`Error starting next recording: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }, 500);
    };

    const handleComplete = () => {
        onComplete(recordings);
    };

    const playRecording = async (index: number) => {
        const recording = recordings.find(r => r.sentenceIndex === index);
        if (!recording || !recording.audioBlob) return;

        // Stop any currently playing audio
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        try {
            const arrayBuffer = await recording.audioBlob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);

            audioSourceRef.current = source;
            setPlaybackDuration(audioBuffer.duration);

            source.onended = () => {
                setIsPlaying(null);
                setCurrentPlaybackTime(0);
            };

            source.start();
            setIsPlaying(index);

            // Update playback progress
            const startTime = audioContextRef.current.currentTime;
            const updateProgress = () => {
                if (isPlaying === index) {
                    const elapsed = audioContextRef.current!.currentTime - startTime;
                    setCurrentPlaybackTime(elapsed);
                    if (elapsed < audioBuffer.duration) {
                        requestAnimationFrame(updateProgress);
                    }
                }
            };
            requestAnimationFrame(updateProgress);

        } catch (error) {
            console.error('Error playing recording:', error);
            setIsPlaying(null);
        }
    };

    const stopPlayback = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            setIsPlaying(null);
            setCurrentPlaybackTime(0);
        }
    };

    const handleExit = () => {
        stopRecording();
        stopPlayback();
        setShowExitConfirmation(true);
    };

    const confirmExit = () => {
        navigate('/dashboard');
    };

    const calculateCircleProgress = () => {
        const progress = (timeLeft / 6) * 100;
        const circumference = 2 * Math.PI * 45;
        return {
            strokeDasharray: circumference,
            strokeDashoffset: circumference - (progress / 100) * circumference,
        };
    };

    const calculatePlaybackProgress = () => {
        if (!playbackDuration) return 0;
        return (currentPlaybackTime / playbackDuration) * 100;
    };

    const handleSubmit = async () => {
        try {
            console.log('Submitting test recordings:', recordings);

            // Stop any ongoing recording or playback
            if (isRecording) {
                stopRecording();
            }
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }

            // Clean up media resources
            if (mediaRecorderRef.current?.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }

            // Clean up audio URLs to prevent memory leaks
            recordings.forEach(recording => {
                if (recording.audioUrl) {
                    URL.revokeObjectURL(recording.audioUrl);
                }
            });

            // Get the current test progress from localStorage
            const currentProgress = localStorage.getItem('testProgress');
            if (currentProgress) {
                const progress = JSON.parse(currentProgress);
                // Update the progress to mark reading as complete
                progress.reading = true;
                localStorage.setItem('testProgress', JSON.stringify(progress));
            }

            // Call onComplete callback if provided
            if (onComplete) {
                onComplete(recordings);
            }

            // Navigate to dashboard
            if (navigate) {
                navigate('/dashboard');
            } else {
                window.location.href = '/dashboard';
            }

        } catch (error) {
            console.error('Error submitting test:', error);
            setDebug(`Error submitting test: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const resetTest = () => {
        // Stop any ongoing recording
        if (isRecording) {
            stopRecording();
        }

        // Clear all recordings
        setRecordings([]);

        // Reset all state variables
        setCurrentSentenceIndex(-1);
        setTimeLeft(6);
        setIsTestComplete(false);
        setIsRecording(false);
        setDebug('');

        // Clear audio chunks
        audioChunksRef.current = [];

        // Stop any ongoing media tracks
        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        mediaRecorderRef.current = null;

        console.log('Test reset complete - ready to start new test');
    };

    const speakSentenceWithElevenLabs = async (text: string, onEnd?: () => void) => {
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

    // Modify the UI to show transcription
    const renderRecordingPlayback = (recording: Recording) => (
        <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => isPlaying === recording.sentenceIndex ? stopPlayback() : playRecording(recording.sentenceIndex)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
                >
                    {isPlaying === recording.sentenceIndex ? (
                        <>
                            <Pause className="w-5 h-5" />
                            Stop
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            Play Recording
                        </>
                    )}
                </button>
                {isPlaying === recording.sentenceIndex && (
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
                        <div className="h-2 flex-1 bg-blue-500/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-100"
                                style={{ width: `${calculatePlaybackProgress()}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
            {recording.transcript && (
                <div className="text-sm text-gray-400 mt-2">
                    <span className="font-semibold text-blue-400">Transcription:</span> {recording.transcript}
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8 font-['Inter']">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-blue-400 text-center">
                        You will see a sentence. Read it aloud clearly and fluently when prompted.<br />
                        You have 6 seconds per sentence.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center px-2 py-4 sm:px-4 sm:py-8 font-['Inter'] overflow-hidden">
            {/* Add debug info if needed */}
            {debug && (
                <div className="fixed top-4 left-4 bg-red-500/20 text-red-400 p-2 rounded">
                    {debug}
                </div>
            )}

            {/* Exit Button - Top Right */}
            <button
                onClick={handleExit}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                aria-label="Exit Test"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showExitConfirmation}
                onClose={() => setShowExitConfirmation(false)}
                onConfirm={confirmExit}
                title="Exit Reading Test"
                message="Are you sure you want to exit? Your progress will be lost and the test will end."
                confirmText="Exit Test"
            />

            {/* Header Section */}
            <div className="text-center mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 flex items-center justify-center gap-2">
                    Round 1 - Reading Test
                </h1>
                <p className="text-base sm:text-lg text-gray-300">
                    Instructions: Read each sentence aloud clearly and fluently. You have 6 seconds per sentence.
                </p>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                {/* Sentence Display Box */}
                <div className="bg-[#1e293b] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-[#334155] mb-4 sm:mb-8 transform transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    {currentSentenceIndex >= 0 ? (
                        <>
                            <p className="text-xl sm:text-2xl md:text-3xl text-center leading-relaxed animate-fadeIn mb-4 sm:mb-6">
                                {sentences[currentSentenceIndex]}
                            </p>
                            {recordings.map((recording, index) => (
                                recording.sentenceIndex === currentSentenceIndex && (
                                    <div key={index}>
                                        {renderRecordingPlayback(recording)}
                                    </div>
                                )
                            ))}
                        </>
                    ) : (
                        <p className="text-2xl text-center text-gray-400 italic">
                            Click "Start Test" to begin...
                        </p>
                    )}
                </div>

                {/* Controls + Timer Section */}
                <div className="flex flex-col items-center gap-4 sm:gap-8">
                    {/* Timer Circle */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                        <svg className="transform -rotate-90 w-full h-full">
                            {/* Background circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="45"
                                stroke="#334155"
                                strokeWidth="8"
                                fill="none"
                            />
                            {/* Progress circle */}
                            {isRecording && (
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="45"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    {...calculateCircleProgress()}
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
                        {/* Timer Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{timeLeft}</span>
                        </div>
                    </div>

                    {/* Recording Status */}
                    <div className="flex items-center gap-2 text-lg">
                        {isRecording ? (
                            <>
                                <Mic className="w-6 h-6 text-green-400 animate-pulse" />
                                <span className="text-green-400">Recording Active</span>
                            </>
                        ) : (
                            <>
                                <MicOff className="w-6 h-6 text-gray-400" />
                                <span className="text-gray-400">Recording Inactive</span>
                            </>
                        )}
                    </div>

                    {/* Action Buttons - Only show Start Test button */}
                    {currentSentenceIndex === -1 && (
                        <button
                            onClick={startTest}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
                            aria-label="Start Test"
                        >
                            <span className="flex items-center gap-2">
                                <Play className="w-6 h-6" />
                                Start Test
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Indicator */}
            {currentSentenceIndex >= 0 && (
                <div className="mt-4 sm:mt-8 text-gray-400 text-center">
                    Sentence {currentSentenceIndex + 1} of {sentences.length}
                </div>
            )}

            <audio ref={audioRef} hidden />
        </div>
    );
};

export default Reading;

function exportWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const interleaved = audioBuffer.getChannelData(0);
    const buffer = new ArrayBuffer(44 + interleaved.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // Write PCM audio data
    const volume = 1;
    let index = 44;
    for (let i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    return buffer;
}

function writeUTFBytes(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}






