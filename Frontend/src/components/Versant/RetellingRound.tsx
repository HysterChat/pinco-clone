import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, CheckCircle, X, AlertTriangle } from 'lucide-react';
import API from '../../services/api';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

interface RetellingRoundProps {
    onComplete: (recordings: Array<{
        audioBlob: Blob;
        audioUrl: string;
        story: string;
        transcript?: string;  // Added transcript field
    }>) => void;
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

const RetellingRound: React.FC<RetellingRoundProps> = ({ onComplete, onStart }) => {
    const [step, setStep] = useState<'start' | 'loading' | 'bot' | 'record'>('start');
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
    const [story, setStory] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [recordings, setRecordings] = useState<any[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null); // For ElevenLabs TTS audio
    const [stories, setStories] = useState<string[]>([]);
    const [transcriptions, setTranscriptions] = useState<{ [key: number]: string }>({});
    const elevenlabsRef = useRef<ElevenLabsClient | null>(null);

    const startTest = async () => {
        try {
            if (onStart) {
                onStart();
            }
            // Rest of the start test logic
            setCurrentStoryIndex(0);
            setIsRecording(false);
            setRecordings([]);
            // Additional initialization code...
        } catch (error) {
            console.error('Error starting test:', error);
            setError('Failed to start test. Please try again.');
        }
    };

    const speakStoryWithElevenLabs = async (text: string, onEnd?: () => void) => {
        setIsBotSpeaking(true);
        try {
            const apiKey = import.meta.env.VITE_ELEVEN_LAB;
            const voiceId = import.meta.env.VITE_ELEVEN_LAB_VOICE_ID_3;
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

    // Start the round
    const handleStartRound = async () => {
        setStep('loading');
        setError(null);
        try {
            const res = await API.getStoryTeller();
            const storyList = res.stories;
            setStories(storyList);
            setCurrentStoryIndex(0);
            setStory(storyList[0] || '');
            setRecordings([]);
            setUserAudioUrl(null);
            setStep('bot');
        } catch (err: any) {
            setError('Failed to load story. Please try again.');
            setStep('start');
        }
    };

    // Bot speaks the story
    useEffect(() => {
        if (step === 'bot' && stories.length > 0 && story) {
            setIsBotSpeaking(true);
            speakStoryWithElevenLabs(story, () => {
                setIsBotSpeaking(false);
                setStep('record');
                setTimeLeft(30);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, story]);

    // Initialize ElevenLabs client
    useEffect(() => {
        const apiKey = import.meta.env.VITE_ELEVEN_LAB;
        if (apiKey) {
            elevenlabsRef.current = new ElevenLabsClient({
                apiKey: apiKey
            });
        }
    }, []);

    // Start/stop recording for 30s
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 'record' && !isRecording) {
            // Start recording
            (async () => {
                try {
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
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        setUserAudioUrl(audioUrl);

                        // Get transcription if ElevenLabs client is available
                        let transcript: string | null = null;
                        try {
                            if (elevenlabsRef.current) {
                                const transcription = await elevenlabsRef.current.speechToText.convert({
                                    file: audioBlob,
                                    modelId: "scribe_v1",
                                    tagAudioEvents: true,
                                    languageCode: "eng",
                                    diarize: true,
                                });

                                console.log('Transcription:', transcription);
                                transcript = transcription.text;
                                setTranscriptions(prev => ({
                                    ...prev,
                                    [currentStoryIndex]: transcription.text || ''
                                }));
                            }
                        } catch (error) {
                            console.error('Error getting transcription:', error);
                        }

                        // Save recording with transcript
                        const newRecordings = [...recordings, {
                            audioBlob,
                            audioUrl,
                            story: stories[currentStoryIndex],
                            transcript
                        }];
                        setRecordings(newRecordings);

                        stream.getTracks().forEach(track => track.stop());
                        setIsRecording(false);

                        // Move to next story or complete
                        if (currentStoryIndex < stories.length - 1) {
                            setTimeout(() => {
                                setCurrentStoryIndex(idx => idx + 1);
                                setUserAudioUrl(null);
                                setStep('bot');
                            }, 1000);
                        } else {
                            // All stories done
                            onComplete(newRecordings);
                        }
                    };
                    mediaRecorder.start();
                    setIsRecording(true);
                } catch (err) {
                    alert('Could not start recording. Please allow microphone access.');
                }
            })();
        }
        if (step === 'record' && isRecording) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            mediaRecorderRef.current.stop();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, isRecording]);

    // When currentStoryIndex changes, update the story
    useEffect(() => {
        if (stories.length > 0 && currentStoryIndex < stories.length) {
            setStory(stories[currentStoryIndex]);
        }
    }, [currentStoryIndex, stories]);

    // Update the UI to show transcription
    const renderRecordingStatus = () => (
        <div className="flex flex-col items-center gap-6">
            <div className="text-center text-gray-300 mb-4">
                Please retell the story in your own words.
            </div>
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={() => {
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            mediaRecorderRef.current.stop();
                        }
                        setIsRecording(false);
                    }}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 flex items-center gap-2"
                >
                    <Mic className="w-5 h-5 animate-pulse" />
                    Stop Recording
                </button>
            </div>
            <div className="text-sm text-gray-400">
                Recording in progress... <span className='font-bold text-white'>{timeLeft}s</span> left
            </div>
            {transcriptions[currentStoryIndex] && (
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-gray-400">Your retelling:</p>
                    <p className="text-white">{transcriptions[currentStoryIndex]}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-[#334155]">
                <h1 className="text-3xl font-bold mb-6 text-center">Round 4 - Retelling Round</h1>
                {step === 'start' && (
                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={handleStartRound}
                            className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
                        >
                            Start Round
                        </button>
                        {error && <div className="text-red-400 mt-2">{error}</div>}
                    </div>
                )}
                {step === 'loading' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg text-blue-400 text-center">Listen to the story carefully. You will be asked to retell it in your own words. You have 30 seconds to respond.</p>
                    </div>
                )}
                {step === 'bot' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                <Volume2 className="w-16 h-16 text-blue-500 animate-pulse" />
                            </div>
                            <p className="text-lg text-blue-400">Bot is telling the story...</p>
                        </div>
                    </div>
                )}
                {step === 'record' && renderRecordingStatus()}
            </div>
            <audio ref={audioRef} hidden />
        </div>
    );
};

export default RetellingRound; 