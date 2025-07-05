import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const DEFAULT_QUESTIONS = [
    "Describe a memorable event from your life and explain why it was significant to you.",
    "What is a goal you hope to achieve in the next five years, and how do you plan to accomplish it?"
];

interface OpenResponseProps {
    onComplete?: (result: {
        audioUrls: (string | null)[];
        transcripts?: (string | null)[];
    }) => void;
}

const OpenResponse: React.FC<OpenResponseProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'start' | 'loading' | 'bot' | 'record' | 'done'>('start');
    const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(40);
    const [userAudioUrls, setUserAudioUrls] = useState<(string | null)[]>([null, null]);
    const [transcriptions, setTranscriptions] = useState<(string | null)[]>([null, null]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const navigate = useNavigate();
    const elevenlabsRef = useRef<ElevenLabsClient | null>(null);

    // ElevenLabs TTS
    const speakWithElevenLabs = async (text: string, onEnd?: () => void) => {
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

    // Initialize ElevenLabs client
    useEffect(() => {
        const apiKey = import.meta.env.VITE_ELEVEN_LAB;
        if (apiKey) {
            elevenlabsRef.current = new ElevenLabsClient({
                apiKey: apiKey
            });
        }
    }, []);

    // Start the round
    const handleStart = async () => {
        setStep('loading');
        try {
            const res = await API.getOpenQuestions();
            if (res && Array.isArray(res.questions) && res.questions.length === 2) {
                setQuestions(res.questions);
                setUserAudioUrls([null, null]);
            } else {
                setQuestions(DEFAULT_QUESTIONS);
                setUserAudioUrls([null, null]);
            }
        } catch (e) {
            setQuestions(DEFAULT_QUESTIONS);
            setUserAudioUrls([null, null]);
        }
        setCurrentQuestion(0);
        setStep('bot');
    };

    // Bot speaks the question
    useEffect(() => {
        if (step === 'bot' && currentQuestion < questions.length) {
            speakWithElevenLabs(questions[currentQuestion], () => {
                setStep('record');
                setTimeLeft(40);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, currentQuestion, questions]);

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
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);

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

                                // Only log the text property of the transcription
                                if (transcription?.text) {
                                    console.log('Transcription text:', transcription.text);
                                    transcript = transcription.text.trim();
                                    setTranscriptions(prev => {
                                        const updated = [...prev];
                                        updated[currentQuestion] = transcript;
                                        return updated;
                                    });
                                } else {
                                    console.warn('No transcription text available');
                                    setTranscriptions(prev => {
                                        const updated = [...prev];
                                        updated[currentQuestion] = 'No transcription available';
                                        return updated;
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('Error getting transcription:', error);
                            setTranscriptions(prev => {
                                const updated = [...prev];
                                updated[currentQuestion] = 'Error transcribing audio';
                                return updated;
                            });
                        }

                        setUserAudioUrls(prev => {
                            const updated = [...prev];
                            updated[currentQuestion] = audioUrl;
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
        if (step === 'record' && !isRecording && userAudioUrls[currentQuestion]) {
            if (currentQuestion < questions.length - 1) {
                setTimeout(() => {
                    setCurrentQuestion(q => q + 1);
                    setStep('bot');
                }, 1000);
            } else {
                setStep('done');
                if (onComplete) {
                    onComplete({
                        audioUrls: userAudioUrls,
                        transcripts: transcriptions
                    });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, isRecording, userAudioUrls, currentQuestion, questions]);

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
                {step === 'bot' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                <Volume2 className="w-16 h-16 text-blue-500 animate-pulse" />
                            </div>
                            <p className="text-lg text-blue-400">Bot is asking the question...</p>
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

                        {/* Display transcription */}
                        {transcriptions[currentQuestion] && (
                            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg w-full">
                                <p className="text-sm text-gray-400 mb-2">Your response:</p>
                                <p className="text-white">{transcriptions[currentQuestion]}</p>
                            </div>
                        )}
                    </div>
                )}
                {step === 'done' && (
                    <div className="flex flex-col items-center gap-6">
                        <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                        <h2 className="text-2xl font-semibold text-green-400">Round Complete!</h2>
                        <p className="text-gray-300">You have completed the Open Question Round. Your responses have been recorded.</p>

                        {/* Display all transcriptions */}
                        <div className="w-full space-y-4 mt-4">
                            {questions.map((question, index) => (
                                <div key={index} className="p-4 bg-[#334155] rounded-lg">
                                    <p className="text-sm text-gray-400 mb-2">Question {index + 1}:</p>
                                    <p className="text-white mb-4">{question}</p>
                                    {transcriptions[index] && (
                                        <>
                                            <p className="text-sm text-gray-400 mb-2">Your response:</p>
                                            <p className="text-white">{transcriptions[index]}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

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
