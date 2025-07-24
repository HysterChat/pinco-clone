import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



// 1. Hardcode the list of available round 6 audio filenames at the top of the component (after imports):
const AVAILABLE_ROUND6_FILES = [
    "R6-1.mp3",
    "R6-2.mp3",
    "R6-3.mp3",
    "R6-4.mp3",
    "R6-5.mp3",
    "R6-6.mp3"
];

interface OpenResponseProps {
    onComplete?: (result: {
        audioUrls: (string | null)[];
    }) => void;
}

const OpenResponse: React.FC<OpenResponseProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'start' | 'loading' | 'audio' | 'record' | 'done'>('start');
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(40);
    const [userAudioUrls, setUserAudioUrls] = useState<(string | null)[]>([null, null]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const navigate = useNavigate();



    const [selectedAudioFiles, setSelectedAudioFiles] = useState<string[]>([]);
    const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Helper to get N unique random items from an array
    function getRandomItems(arr: string[], n: number) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    const handleStart = async () => {
        setStep('loading');
        const randomAudios = getRandomItems(AVAILABLE_ROUND6_FILES, 2);
        setSelectedAudioFiles(randomAudios);
        setCurrentAudioIndex(0);
        setIsAudioPlaying(true);
        setUserAudioUrls(Array(2).fill(null));
    };

    useEffect(() => {
        if (isAudioPlaying && currentAudioIndex >= 0 && currentAudioIndex < selectedAudioFiles.length) {
            const audioPath = `/speechmaa/round6/${selectedAudioFiles[currentAudioIndex]}`;
            if (audioRef.current) {
                audioRef.current.src = audioPath;
                audioRef.current.onended = () => {
                    setIsAudioPlaying(false);
                    setStep('record');
                    setTimeLeft(40);
                };
                audioRef.current.play();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAudioIndex, isAudioPlaying]);

    // Start/stop recording for 40s
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
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                        const audioUrl = URL.createObjectURL(audioBlob);

                        setUserAudioUrls(prev => {
                            const updated = [...prev];
                            updated[currentAudioIndex] = audioUrl;
                            return updated;
                        });

                        stream.getTracks().forEach(track => track.stop());
                        setIsRecording(false);
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

    // After recording, move to next question or finish
    useEffect(() => {
        if (step === 'record' && !isRecording && userAudioUrls[currentAudioIndex]) {
            if (currentAudioIndex < selectedAudioFiles.length - 1) {
                setTimeout(() => {
                    setCurrentAudioIndex(idx => idx + 1);
                    setStep('audio');
                    setIsAudioPlaying(true);
                }, 1000);
            } else {
                setStep('done');
                if (onComplete) {
                    onComplete({
                        audioUrls: userAudioUrls
                    });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, isRecording, userAudioUrls, currentAudioIndex, selectedAudioFiles]);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-[#334155]">
                <h1 className="text-3xl font-bold mb-6 text-center">Round 6- Open Question Round</h1>
                {step === 'start' && (
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-lg text-gray-300 text-center mb-4">
                            You will hear 2 questions. Each question will be spoken once. After each, you will have 40 seconds to answer. The next question will play automatically after 40 seconds.
                        </p>
                        <button
                            onClick={handleStart}
                            className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
                        >
                            Start Round
                        </button>
                    </div>
                )}
                {step === 'loading' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg text-blue-400 text-center">Loading questions...</p>
                    </div>
                )}
                {step === 'audio' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                <Volume2 className="w-16 h-16 text-blue-500 animate-pulse" />
                            </div>
                            <p className="text-lg text-blue-400">Playing question audio...</p>
                        </div>
                    </div>
                )}
                {step === 'record' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center text-gray-300 mb-4">
                            Please answer the question aloud. You have {timeLeft} seconds.
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
                        <div className="text-sm text-gray-400">Recording in progress... <span className='font-bold text-white'>{timeLeft}s</span> left</div>
                    </div>
                )}
                {step === 'done' && (
                    <div className="flex flex-col items-center gap-6">
                        <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-green-400">Round Complete!</h2>
                        <p className="text-gray-300">You have completed the Open Question Round. Your responses have been recorded.</p>

                        <button
                            onClick={() => navigate('/dashboard/versant/flow')}
                            className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-lg font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
                        >
                            Back to Versant Home
                        </button>
                    </div>
                )}
            </div>
            <audio ref={audioRef} hidden />
        </div>
    );
};

export default OpenResponse;






