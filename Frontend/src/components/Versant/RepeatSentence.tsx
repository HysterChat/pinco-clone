import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, ChevronRight, X, AlertTriangle, Pause, Volume2, Speaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

interface Recording {
    sentenceIndex: number;
    audioBlob: Blob;
    audioUrl?: string;
    transcript?: string;
}

interface RepeatSentenceProps {
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

const RepeatSentence: React.FC<RepeatSentenceProps> = ({ onComplete, onStart }) => {
    const navigate = useNavigate();
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
    const [canUserSpeak, setCanUserSpeak] = useState(false);
    const [transcriptions, setTranscriptions] = useState<{ [key: number]: string }>({});

    // 1. Hardcode the list of available audio filenames at the top of the component (after imports):
    const AVAILABLE_AUDIO_FILES = [
        "Sentence 1.mp3",
        "Sentence 2.mp3",
        "Sentence 3.mp3",
        "Sentence 4.mp3",
        "Sentence 5.mp3",
        "Sentence 6.mp3",
        "Sentence 7.mp3",
        "Sentence 8.mp3",
        "Sentence 9.mp3",
        "Sentence 10.mp3",
        "Sentence 11.mp3",
        "Sentence 12.mp3",
        "Sentence 13.mp3",
        "Sentence 14.mp3",
        "Sentence 15.mp3",
        "Sentence 16.mp3",
        "Sentence 17.mp3",
        "Sentence 18.mp3",
        "Sentence 19.mp3",
        "Sentence 20.mp3",
        "Sentence 21.mp3",
        "Sentence 22.mp3",
        "Sentence 23.mp3",
        "Sentence 24.mp3",
        "Sentence 25.mp3",
        "Sentence 26.mp3",
        "Sentence 27.mp3",
        "Sentence 28.mp3",
        "Sentence 29.mp3",
        "Sentence 30.mp3"
    ];

    // 2. Add new state for selected audio files and current audio index:
    const [selectedAudioFiles, setSelectedAudioFiles] = useState<string[]>([]);
    const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioRetryCount, setAudioRetryCount] = useState<{ [key: number]: number }>({});
    const [audioLoading, setAudioLoading] = useState(false);

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
                const response = await api.getRepeatSentenceTest();
                setSentences(response.sentences);
                setIsLoading(false);
            } catch (error: any) {
                console.error('Error fetching sentences:', error);
                const errorMessage = error?.response?.data?.detail || 'Error fetching sentences. Please try again.';
                setDebug(errorMessage);
                setIsLoading(false);

                // Check for subscription error first
                if (errorMessage.includes('premium users')) {
                    navigate('/pricing');
                    return;
                }

                // Handle other errors
                if (errorMessage.includes('Failed to generate') || errorMessage.includes('Failed to fetch')) {
                    window.location.reload();
                }
            }
        };

        fetchSentences();
    }, [navigate]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRecording) {
            handleNextSentence();
        }
        return () => clearInterval(timer);
    }, [isRecording, timeLeft]);

    // Initialize ElevenLabs client
    useEffect(() => {
        const apiKey = import.meta.env.VITE_ELEVEN_LAB;
        if (apiKey) {
            elevenlabsRef.current = new ElevenLabsClient({
                apiKey: apiKey
            });
        }
    }, []);

    const speakSentenceWithElevenLabs = async (text: string, onEnd?: () => void) => {
        // Remove leading numbers and punctuation (e.g., '1. ', '2) ', '3 - ', etc.)
        const cleanedText = text.replace(/^\s*\d+\s*([\.|\)|-])?\s*/, '');
        setIsBotSpeaking(true);
        try {
            const apiKey = import.meta.env.VITE_ELEVEN_LAB;
            const voiceId = import.meta.env.VITE_ELEVEN_LAB_VOICE_ID_2;
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: cleanedText,
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
                    setCanUserSpeak(true);
                    if (onEnd) onEnd();
                };
                audioRef.current.play();
            }
        } catch (error) {
            setIsBotSpeaking(false);
            setCanUserSpeak(true);
            if (onEnd) onEnd();
        }
    };

    const initializeRecorder = async (recordingIndex: number) => {
        try {
            console.log('Initializing recorder for index:', recordingIndex);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && mediaRecorder.state !== 'inactive') {
                    console.log('Data available for index:', recordingIndex);
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('MediaRecorder stopped for index:', recordingIndex);
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    // Get transcription if ElevenLabs client is available
                    try {
                        if (elevenlabsRef.current) {
                            const transcription = await elevenlabsRef.current.speechToText.convert({
                                file: audioBlob,
                                modelId: "scribe_v1",
                                tagAudioEvents: true,
                                languageCode: "eng",
                                diarize: true,
                            });

                            console.log('Transcription for index', recordingIndex, ':', transcription);
                            setTranscriptions(prev => ({
                                ...prev,
                                [recordingIndex]: transcription.text
                            }));
                        }
                    } catch (error) {
                        console.error('Error getting transcription:', error);
                    }

                    setRecordings(prev => {
                        const newRecording = {
                            sentenceIndex: recordingIndex,
                            audioBlob,
                            audioUrl,
                            transcript: transcriptions[recordingIndex] // Add transcript to recording
                        };

                        const filteredRecordings = prev.filter(r => r.sentenceIndex !== recordingIndex);
                        const newRecordings = [...filteredRecordings, newRecording]
                            .sort((a, b) => a.sentenceIndex - b.sentenceIndex);

                        console.log('Updated recordings:', newRecordings);
                        return newRecordings;
                    });
                }

                // Clean up the stream
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            };

            mediaRecorder.onstart = () => {
                console.log('MediaRecorder started for index:', recordingIndex);
                setIsRecording(true);
                audioChunksRef.current = [];
            };

            return mediaRecorder;
        } catch (error: any) {
            console.error('Error initializing recorder:', error);
            setDebug(`Error initializing recorder: ${error.message}`);
            throw error;
        }
    };

    // 3. Add a function to shuffle and select 8 random audio files:
    function getRandomAudios(files: string[], count: number = 8) {
        const shuffled = [...files].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Add a function to check if audio file exists
    const checkAudioFileExists = async (filename: string): Promise<boolean> => {
        try {
            const response = await fetch(`/speechmaa/readingSentences/${filename}`, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error(`Error checking audio file ${filename}:`, error);
            return false;
        }
    };

    // Add a function to get available audio files
    const getAvailableAudioFiles = async (): Promise<string[]> => {
        const availableFiles: string[] = [];

        for (const filename of AVAILABLE_AUDIO_FILES) {
            const exists = await checkAudioFileExists(filename);
            if (exists) {
                availableFiles.push(filename);
            } else {
                console.warn(`Audio file not found: ${filename}`);
            }
        }

        return availableFiles;
    };

    // 4. Update startTest to select 8 random audios and start playing the first one:
    const startTest = async () => {
        try {
            if (onStart) {
                onStart();
            }
            setRecordings([]);

            // Get available audio files first
            const availableFiles = await getAvailableAudioFiles();

            if (availableFiles.length === 0) {
                throw new Error('No audio files found. Please check if the audio files are properly uploaded.');
            }

            // Select 8 random audio files from available ones
            const randomAudios = getRandomAudios(availableFiles, Math.min(8, availableFiles.length));

            // Preload the first few audio files to prevent loading issues
            const preloadPromises = randomAudios.slice(0, 3).map(async (filename) => {
                try {
                    const audio = new Audio(`/speechmaa/readingSentences/${filename}`);
                    await new Promise((resolve, reject) => {
                        audio.addEventListener('canplaythrough', resolve, { once: true });
                        audio.addEventListener('error', reject, { once: true });
                        audio.load();
                    });
                    console.log(`Preloaded audio: ${filename}`);
                } catch (error) {
                    console.warn(`Failed to preload audio: ${filename}`, error);
                }
            });

            // Wait for preloading to complete (with timeout)
            await Promise.race([
                Promise.all(preloadPromises),
                new Promise(resolve => setTimeout(resolve, 3000)) // 3 second timeout
            ]);

            setSelectedAudioFiles(randomAudios);
            setCurrentAudioIndex(0);
            setIsAudioPlaying(true);
            setCurrentSentenceIndex(-1); // Don't show text sentence
            setTimeLeft(6);
            setIsInitialized(true);

            console.log('Selected audio files:', randomAudios);
        } catch (error) {
            console.error('Error in startTest:', error);
            setDebug(`Error in startTest: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // 5. Add useEffect to play the current audio when currentAudioIndex changes:
    useEffect(() => {
        if (isAudioPlaying && currentAudioIndex >= 0 && currentAudioIndex < selectedAudioFiles.length) {
            const audioPath = `/speechmaa/readingSentences/${selectedAudioFiles[currentAudioIndex]}`;
            if (audioRef.current) {
                const currentRetryCount = audioRetryCount[currentAudioIndex] || 0;

                console.log(`Starting to load audio: ${audioPath}`);
                setAudioLoading(true);

                // Clear any existing event listeners
                audioRef.current.onerror = null;
                audioRef.current.onloadeddata = null;
                audioRef.current.onended = null;
                audioRef.current.oncanplaythrough = null;

                // Add timeout for audio loading
                const audioTimeout = setTimeout(() => {
                    console.log('Audio loading timeout, using TTS fallback');
                    setAudioLoading(false);
                    const sentenceText = sentences[currentAudioIndex] || "Please repeat this sentence.";
                    speakSentenceWithElevenLabs(sentenceText, () => {
                        setIsAudioPlaying(false);
                        setCurrentSentenceIndex(currentAudioIndex);
                        setCanUserSpeak(true);
                        startRecording(currentAudioIndex);
                    });
                }, 10000); // 10 second timeout

                // Add error handling for audio loading
                audioRef.current.onerror = (e) => {
                    console.error('Audio loading error:', e);
                    console.error('Failed to load audio file:', audioPath);
                    setAudioLoading(false);
                    clearTimeout(audioTimeout);

                    // Retry up to 2 times
                    if (currentRetryCount < 2) {
                        console.log(`Retrying audio ${currentAudioIndex} (attempt ${currentRetryCount + 1})`);
                        setAudioRetryCount(prev => ({
                            ...prev,
                            [currentAudioIndex]: currentRetryCount + 1
                        }));

                        // Retry after a short delay
                        setTimeout(() => {
                            if (audioRef.current) {
                                audioRef.current.load();
                                audioRef.current.play().catch(error => {
                                    console.error('Retry failed:', error);
                                    handleNextSentence();
                                });
                            }
                        }, 1000);
                    } else {
                        console.log(`Max retries reached for audio ${currentAudioIndex}, using TTS fallback`);
                        // Use TTS fallback if audio file fails
                        const sentenceText = sentences[currentAudioIndex] || "Please repeat this sentence.";
                        speakSentenceWithElevenLabs(sentenceText, () => {
                            setIsAudioPlaying(false);
                            setCurrentSentenceIndex(currentAudioIndex);
                            setCanUserSpeak(true);
                            startRecording(currentAudioIndex);
                        });
                    }
                };

                audioRef.current.onloadeddata = () => {
                    console.log('Audio loaded successfully:', audioPath);
                    setAudioLoading(false);
                    clearTimeout(audioTimeout);
                    // Reset retry count on successful load
                    setAudioRetryCount(prev => ({
                        ...prev,
                        [currentAudioIndex]: 0
                    }));
                };

                audioRef.current.oncanplaythrough = () => {
                    console.log('Audio can play through:', audioPath);
                    clearTimeout(audioTimeout);
                    // Try to play the audio
                    if (audioRef.current) {
                        audioRef.current.play().then(() => {
                            console.log('Audio started playing successfully');
                        }).catch(error => {
                            console.error('Error playing audio:', error);
                            // Use TTS fallback if play fails
                            const sentenceText = sentences[currentAudioIndex] || "Please repeat this sentence.";
                            speakSentenceWithElevenLabs(sentenceText, () => {
                                setIsAudioPlaying(false);
                                setCurrentSentenceIndex(currentAudioIndex);
                                setCanUserSpeak(true);
                                startRecording(currentAudioIndex);
                            });
                        });
                    }
                };

                audioRef.current.onended = () => {
                    console.log('Audio ended:', audioPath);
                    clearTimeout(audioTimeout);
                    setIsAudioPlaying(false);
                    setCurrentSentenceIndex(currentAudioIndex); // Now show the recording UI for this index
                    setCanUserSpeak(true);
                    startRecording(currentAudioIndex);
                };

                // Set the source and load the audio
                audioRef.current.src = audioPath;
                audioRef.current.load();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAudioIndex, isAudioPlaying]);

    const startRecording = async (index: number) => {
        try {
            // Clean up any existing recorder
            if (mediaRecorderRef.current) {
                if (mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }

            console.log('Starting recording for sentence index:', index);
            setTimeLeft(6);
            const mediaRecorder = await initializeRecorder(index);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
        } catch (error: any) {
            console.error('Error in startRecording:', error);
            setDebug(`Error in startRecording: ${error.message}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('Stopping recording for current index:', currentSentenceIndex);
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Clean up the stream
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }
    };

    // 6. Update handleNextSentence to play the next audio (if any):
    const handleNextSentence = () => {
        const currentIndex = currentSentenceIndex;
        console.log('Handling next sentence, current index:', currentIndex);

        if (isRecording) {
            stopRecording();
        }

        setTimeout(async () => {
            if (currentAudioIndex + 1 >= selectedAudioFiles.length) {
                console.log('Test complete');
                if (onComplete) {
                    onComplete(recordings);
                }
                if (mediaRecorderRef.current?.stream) {
                    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                }
                recordings.forEach(recording => {
                    if (recording.audioUrl) {
                        URL.revokeObjectURL(recording.audioUrl);
                    }
                });
            } else {
                const nextAudioIndex = currentAudioIndex + 1;
                setCurrentAudioIndex(nextAudioIndex);
                setIsAudioPlaying(true);
                setCurrentSentenceIndex(-1); // Hide text until audio finishes
                setTimeLeft(6);
                setCanUserSpeak(false);
            }
        }, 500);
    };

    const handleComplete = () => {
        onComplete(recordings);
    };

    const playRecording = async (index: number) => {
        const recording = recordings.find(r => r.sentenceIndex === index);
        if (!recording || !recording.audioBlob) return;

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
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
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
            if (isRecording) {
                stopRecording();
            }
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            if (mediaRecorderRef.current?.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }

            recordings.forEach(recording => {
                if (recording.audioUrl) {
                    URL.revokeObjectURL(recording.audioUrl);
                }
            });

            const currentProgress = localStorage.getItem('testProgress');
            if (currentProgress) {
                const progress = JSON.parse(currentProgress);
                progress.repeatSentence = true;
                localStorage.setItem('testProgress', JSON.stringify(progress));
            }

            if (onComplete) {
                onComplete(recordings);
            }

            navigate('/dashboard');

        } catch (error: any) {
            console.error('Error submitting test:', error);
            setDebug(`Error submitting test: ${error.message}`);
        }
    };

    const resetTest = () => {
        if (isRecording) {
            stopRecording();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setRecordings([]);
        setCurrentSentenceIndex(-1);
        setTimeLeft(6);
        setIsTestComplete(false);
        setIsRecording(false);
        setIsBotSpeaking(false);
        setCanUserSpeak(false);
        setDebug('');
        setAudioRetryCount({}); // Reset retry count
        audioChunksRef.current = [];

        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        mediaRecorderRef.current = null;
    };

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current) {
                if (mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                mediaRecorderRef.current = null;
            }
            audioChunksRef.current = [];
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            recordings.forEach(recording => {
                if (recording.audioUrl) {
                    URL.revokeObjectURL(recording.audioUrl);
                }
            });
        };
    }, []);

    // Add transcription display to the recording playback UI
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
                    <span className="font-semibold text-blue-400">Your response:</span> {recording.transcript}
                </div>
            )}
            {recording.transcript && sentences[recording.sentenceIndex] && (
                <div className="text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">Original:</span> {sentences[recording.sentenceIndex]}
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8 font-['Inter']">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-blue-400 text-center">You will hear a sentence. Listen carefully and repeat it exactly as you hear it. You have 6 seconds per sentence.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8 font-['Inter']">
            {debug && (
                <div className="fixed top-4 left-4 bg-red-500/20 text-red-400 p-2 rounded">
                    {debug}
                </div>
            )}

            <button
                onClick={handleExit}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                aria-label="Exit Test"
            >
                <X className="w-6 h-6" />
            </button>

            <ConfirmationModal
                isOpen={showExitConfirmation}
                onClose={() => setShowExitConfirmation(false)}
                onConfirm={confirmExit}
                title="Exit Repeat Sentence Test"
                message="Are you sure you want to exit? Your progress will be lost and the test will end."
                confirmText="Exit Test"
            />

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                    Round 2 - Repeat Sentence Test
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl">
                    Instrucations: Listen carefully to each sentence and repeat it exactly as you hear it.
                </p>
            </div>

            <div className="w-full max-w-3xl">
                <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-[#334155] mb-8 transform transition-all duration-500 hover:scale-[1.02]">
                    {isAudioPlaying && currentAudioIndex >= 0 ? (
                        <div className="text-center">
                            <p className="text-xl sm:text-2xl md:text-3xl text-center leading-relaxed animate-fadeIn mb-4 sm:mb-6">
                                {audioLoading ? 'Loading audio...' : 'Playing audio...'}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-blue-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400"></div>
                                <span>{audioLoading ? 'Loading audio file' : 'Audio is playing'}</span>
                            </div>
                        </div>
                    ) : currentSentenceIndex >= 0 ? (
                        <>
                            <p className="text-xl sm:text-2xl md:text-3xl text-center leading-relaxed animate-fadeIn mb-4 sm:mb-6">
                                Please repeat the sentence .
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

                <div className="flex flex-col items-center gap-8">
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
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{timeLeft}</span>
                        </div>
                    </div>

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
                    {currentSentenceIndex === -1 && !isAudioPlaying && (
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

            {currentSentenceIndex >= 0 && (
                <div className="mt-8 text-gray-400">
                    Sentence {currentSentenceIndex + 1} of {sentences.length}
                </div>
            )}

            <audio ref={audioRef} hidden />
        </div>
    );
};

export default RepeatSentence;






