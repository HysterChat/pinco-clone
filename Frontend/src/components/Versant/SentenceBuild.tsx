import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Check, Play, Volume2, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Define the sentence data structure
interface Sentence {
    phrases: string[];
    correct: string;
}

interface SentenceBuildProps {
    onComplete?: (results: Array<{
        attempted: string;
        correct: boolean;
        correctSentence: string;
        userSentence: string;
        audioBlob?: Blob;
        audioUrl?: string;
        transcript?: string;
    }>) => void;
    onStart?: () => void;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

// Sample sentences
const ALL_SENTENCES: Sentence[] = [
    // Intermediate Sentences (60)
    { phrases: ["on the rooftop", "the kids", "are playing"], correct: "the kids are playing on the rooftop" },
    { phrases: ["in the hallway", "the janitor", "is mopping"], correct: "the janitor is mopping in the hallway" },
    { phrases: ["at the dentist", "she", "got a checkup"], correct: "she got a checkup at the dentist" },
    { phrases: ["to the stadium", "they", "walked quickly"], correct: "they walked quickly to the stadium" },
    { phrases: ["in the airport", "travelers", "wait patiently"], correct: "travelers wait patiently in the airport" },
    { phrases: ["at the bus stop", "he", "waited alone"], correct: "he waited alone at the bus stop" },
    { phrases: ["on the street", "vendors", "sell snacks"], correct: "vendors sell snacks on the street" },
    { phrases: ["in the science lab", "students", "wear goggles"], correct: "students wear goggles in the science lab" },
    { phrases: ["at the coffee shop", "friends", "meet often"], correct: "friends meet often at the coffee shop" },
    { phrases: ["in the waiting room", "patients", "sit quietly"], correct: "patients sit quietly in the waiting room" },
    { phrases: ["on the chalkboard", "the teacher", "wrote notes"], correct: "the teacher wrote notes on the chalkboard" },
    { phrases: ["in the elevator", "people", "stood silently"], correct: "people stood silently in the elevator" },
    { phrases: ["at the gas station", "he", "filled petrol"], correct: "he filled petrol at the gas station" },
    { phrases: ["to the hospital", "the ambulance", "rushed quickly"], correct: "the ambulance rushed quickly to the hospital" },
    { phrases: ["in the desert", "camels", "walk slowly"], correct: "camels walk slowly in the desert" },
    { phrases: ["on the bridge", "cars", "moved slowly"], correct: "cars moved slowly on the bridge" },
    { phrases: ["at the construction site", "workers", "build structures"], correct: "workers build structures at the construction site" },
    { phrases: ["in the temple", "devotees", "offered prayers"], correct: "devotees offered prayers in the temple" },
    { phrases: ["on the highway", "trucks", "travel far"], correct: "trucks travel far on the highway" },
    { phrases: ["at the clothing store", "shoppers", "try clothes"], correct: "shoppers try clothes at the clothing store" },
    { phrases: ["in the flower shop", "customers", "buy roses"], correct: "customers buy roses in the flower shop" },
    { phrases: ["at the railway station", "passengers", "wait for trains"], correct: "passengers wait for trains at the railway station" },
    { phrases: ["in the forest", "campers", "set up tents"], correct: "campers set up tents in the forest" },
    { phrases: ["at the mall", "children", "play games"], correct: "children play games at the mall" },
    { phrases: ["on the farm", "farmers", "grow crops"], correct: "farmers grow crops on the farm" },
    { phrases: ["in the stadium", "players", "score goals"], correct: "players score goals in the stadium" },
    { phrases: ["at the waterfall", "tourists", "take pictures"], correct: "tourists take pictures at the waterfall" },
    { phrases: ["on the screen", "the movie", "appeared clearly"], correct: "the movie appeared clearly on the screen" },
    { phrases: ["in the backyard", "kids", "played cricket"], correct: "kids played cricket in the backyard" },
    { phrases: ["in the newsroom", "reporters", "wrote headlines"], correct: "reporters wrote headlines in the newsroom" },
    { phrases: ["at the food court", "diners", "ate lunch"], correct: "diners ate lunch at the food court" },
    { phrases: ["in the garden", "bees", "gather nectar"], correct: "bees gather nectar in the garden" },
    { phrases: ["at the tech fair", "engineers", "showcase innovations"], correct: "engineers showcase innovations at the tech fair" },
    { phrases: ["on the bulletin board", "announcements", "were posted"], correct: "announcements were posted on the bulletin board" },
    { phrases: ["at the fuel station", "motorists", "waited in line"], correct: "motorists waited in line at the fuel station" },
    { phrases: ["in the rehearsal room", "dancers", "practiced steps"], correct: "dancers practiced steps in the rehearsal room" },
    { phrases: ["on the canal", "boats", "floated gently"], correct: "boats floated gently on the canal" },
    { phrases: ["in the hallway", "paintings", "were displayed"], correct: "paintings were displayed in the hallway" },
    { phrases: ["at the news desk", "anchors", "delivered updates"], correct: "anchors delivered updates at the news desk" },
    { phrases: ["in the workshop", "carpenters", "crafted furniture"], correct: "carpenters crafted furniture in the workshop" },
    { phrases: ["at the campsite", "scouts", "built a fire"], correct: "scouts built a fire at the campsite" },
    { phrases: ["on the rooftop", "satellite dishes", "were installed"], correct: "satellite dishes were installed on the rooftop" },
    { phrases: ["in the dormitory", "students", "shared stories"], correct: "students shared stories in the dormitory" },
    { phrases: ["at the aquarium", "visitors", "watched jellyfish"], correct: "visitors watched jellyfish at the aquarium" },
    { phrases: ["on the dock", "fishermen", "unloaded the catch"], correct: "fishermen unloaded the catch on the dock" },
    { phrases: ["in the studio", "painters", "created portraits"], correct: "painters created portraits in the studio" },
    { phrases: ["at the community center", "neighbors", "gather regularly"], correct: "neighbors gather regularly at the community center" },
    { phrases: ["on the whiteboard", "instructions", "were written"], correct: "instructions were written on the whiteboard" },
    { phrases: ["in the greenhouse", "plants", "grow rapidly"], correct: "plants grow rapidly in the greenhouse" },
    { phrases: ["at the shelter", "volunteers", "served meals"], correct: "volunteers served meals at the shelter" },
    { phrases: ["in the headquarters", "officials", "planned operations"], correct: "officials planned operations in the headquarters" },
    { phrases: ["on the stage", "actors", "delivered lines"], correct: "actors delivered lines on the stage" },
    { phrases: ["at the food stall", "people", "lined up"], correct: "people lined up at the food stall" },
    { phrases: ["in the garage", "tools", "hung neatly"], correct: "tools hung neatly in the garage" },
    { phrases: ["on the field", "players", "warmed up"], correct: "players warmed up on the field" },
    { phrases: ["at the help desk", "attendants", "answered queries"], correct: "attendants answered queries at the help desk" },

    // Advanced Sentences (40)
    { phrases: ["in the conference room", "executives", "strategized intensely"], correct: "executives strategized intensely in the conference room" },
    { phrases: ["on the battlefield", "soldiers", "demonstrated valor"], correct: "soldiers demonstrated valor on the battlefield" },
    { phrases: ["in the laboratory", "researchers", "analyzed samples meticulously"], correct: "researchers analyzed samples meticulously in the laboratory" },
    { phrases: ["at the negotiation table", "leaders", "discussed peace terms"], correct: "leaders discussed peace terms at the negotiation table" },
    { phrases: ["within the manuscript", "the author", "embedded hidden meanings"], correct: "the author embedded hidden meanings within the manuscript" },
    { phrases: ["at the archaeological site", "experts", "discovered ancient artifacts"], correct: "experts discovered ancient artifacts at the archaeological site" },
    { phrases: ["in the symphony hall", "the orchestra", "performed flawlessly"], correct: "the orchestra performed flawlessly in the symphony hall" },
    { phrases: ["on the bulletin board", "the principal", "posted announcements"], correct: "the principal posted announcements on the bulletin board" },
    { phrases: ["in the observatory dome", "astronomers", "monitored celestial bodies"], correct: "astronomers monitored celestial bodies in the observatory dome" },
    { phrases: ["at the environmental summit", "activists", "voiced strong opinions"], correct: "activists voiced strong opinions at the environmental summit" },
    { phrases: ["in the board meeting", "stakeholders", "raised valid concerns"], correct: "stakeholders raised valid concerns in the board meeting" },
    { phrases: ["on the expedition", "scientists", "collected diverse specimens"], correct: "scientists collected diverse specimens on the expedition" },
    { phrases: ["at the international airport", "passengers", "navigated customs checks"], correct: "passengers navigated customs checks at the international airport" },
    { phrases: ["in the operating room", "surgeons", "performed complex procedures"], correct: "surgeons performed complex procedures in the operating room" },
    { phrases: ["at the innovation center", "developers", "built futuristic prototypes"], correct: "developers built futuristic prototypes at the innovation center" },
    { phrases: ["on the data dashboard", "analysts", "observed critical trends"], correct: "analysts observed critical trends on the data dashboard" },
    { phrases: ["within the archives", "historians", "unearthed rare documents"], correct: "historians unearthed rare documents within the archives" },
    { phrases: ["in the courtroom", "lawyers", "presented compelling arguments"], correct: "lawyers presented compelling arguments in the courtroom" },
    { phrases: ["at the press conference", "spokespersons", "delivered statements"], correct: "spokespersons delivered statements at the press conference" },
    { phrases: ["on the simulation screen", "technicians", "monitored real-time data"], correct: "technicians monitored real-time data on the simulation screen" },
    { phrases: ["at the film premiere", "celebrities", "walked the red carpet"], correct: "celebrities walked the red carpet at the film premiere" },
    { phrases: ["in the control tower", "air traffic controllers", "coordinated flights"], correct: "air traffic controllers coordinated flights in the control tower" },
    { phrases: ["at the investor summit", "entrepreneurs", "pitched groundbreaking ideas"], correct: "entrepreneurs pitched groundbreaking ideas at the investor summit" },
    { phrases: ["on the research panel", "scientists", "debated ethical concerns"], correct: "scientists debated ethical concerns on the research panel" },
    { phrases: ["in the digital vault", "hackers", "attempted unauthorized access"], correct: "hackers attempted unauthorized access in the digital vault" },
    { phrases: ["on the emergency channel", "dispatchers", "relayed critical information"], correct: "dispatchers relayed critical information on the emergency channel" },
    { phrases: ["at the gala dinner", "philanthropists", "pledged donations"], correct: "philanthropists pledged donations at the gala dinner" },
    { phrases: ["on the innovation board", "strategists", "outlined next-gen plans"], correct: "strategists outlined next-gen plans on the innovation board" },
    { phrases: ["in the crisis center", "officials", "issued public alerts"], correct: "officials issued public alerts in the crisis center" },
    { phrases: ["at the think tank", "analysts", "forecasted global trends"], correct: "analysts forecasted global trends at the think tank" },
    { phrases: ["within the launch chamber", "engineers", "tested ignition sequences"], correct: "engineers tested ignition sequences within the launch chamber" },
    { phrases: ["at the ethics forum", "scholars", "debated philosophical questions"], correct: "scholars debated philosophical questions at the ethics forum" },
    { phrases: ["in the broadcast studio", "anchors", "delivered breaking news"], correct: "anchors delivered breaking news in the broadcast studio" },
    { phrases: ["at the cybersecurity summit", "experts", "proposed new protocols"], correct: "experts proposed new protocols at the cybersecurity summit" },
    { phrases: ["on the prediction model", "data scientists", "trained algorithms"], correct: "data scientists trained algorithms on the prediction model" },
    { phrases: ["in the forensic lab", "investigators", "examined trace evidence"], correct: "investigators examined trace evidence in the forensic lab" },
    { phrases: ["at the international court", "judges", "deliberated war crimes"], correct: "judges deliberated war crimes at the international court" }
];

const AVAILABLE_JUMBLED_FILES = [
    "Jumbled_sentence_1.mp3",
    "Jumbled_sentence_2.mp3",
    "Jumbled_sentence_3.mp3",
    "Jumbled_sentence_4.mp3",
    "Jumbled_sentence_5.mp3",
    "Jumbled_sentence_6.mp3",
    "Jumbled_sentence_7.mp3",
    "Jumbled_sentence_8.mp3",
    "Jumbled_sentence_9.mp3",
    "Jumbled_sentence_10.mp3",
    "Jumbled_sentence_11.mp3",
    "Jumbled_sentence_12.mp3",
    "Jumbled_sentence_13.mp3",
    "Jumbled_sentence_14.mp3",
    "Jumbled_sentence_15.mp3",
    "Jumbled_sentence_16.mp3",
    "Jumbled_sentence_17.mp3",
    "Jumbled_sentence_18.mp3",
    "Jumbled_sentence_19.mp3",
    "Jumbled_sentence_20.mp3"
];

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

// Function to shuffle array and get random 10 sentences (changed from 5)
const getRandomSentences = (sentences: Sentence[], count: number = 10): Sentence[] => {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

function getRandomAudios(files: string[], count: number = 10) {
    const shuffled = [...files].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Add a helper to get N unique random indices
function getRandomIndices(length: number, count: number) {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, count);
}

const SentenceBuild: React.FC<SentenceBuildProps> = ({ onComplete = () => { }, onStart }) => {
    const navigate = useNavigate();

    // Speech recognition hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const [allSentences] = useState<Sentence[]>(ALL_SENTENCES);
    const [currentRoundSentences, setCurrentRoundSentences] = useState<Sentence[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
    const [availablePhrases, setAvailablePhrases] = useState<string[]>([]);
    const [results, setResults] = useState<Array<{
        attempted: string;
        correct: boolean;
        correctSentence: string;
        userSentence: string;
        audioBlob?: Blob;
        audioUrl?: string;
        transcript?: string;
    }>>([]);
    const [showExitConfirmation, setShowExitConfirmation] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
    const [isRecording, setIsRecording] = useState(false);
    const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [recordingTimer, setRecordingTimer] = useState<number>(10);
    const [isRecordingPhase, setIsRecordingPhase] = useState(false);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [transcriptions, setTranscriptions] = useState<{ [key: number]: string }>({});
    const [selectedAudioFiles, setSelectedAudioFiles] = useState<string[]>([]);
    const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Check browser support for speech recognition
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error('Browser does not support speech recognition');
        }
    }, [browserSupportsSpeechRecognition]);

    // Monitor transcript changes
    useEffect(() => {
        console.log('Transcript changed:', transcript);
        console.log('Listening:', listening);
    }, [transcript, listening]);

    // ElevenLabs TTS for jumbled sentence with 0.5s delay between phrases
    // Removed since we're only using audio files to prevent duplicate audio
    // const speakJumbledWithDelay = async (phrases: string[], onEnd?: () => void) => {
    //     setIsBotSpeaking(true);
    //     try {
    //         const apiKey = import.meta.env.VITE_ELEVEN_LAB;
    //         const voiceId = import.meta.env.VITE_ELEVEN_LAB_VOICE_ID_3;
    //         const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    //         for (let i = 0; i < phrases.length; i++) {
    //             const text = phrases[i];
    //             const response = await fetch(url, {
    //             method: 'POST',
    //             headers: {
    //                 'Accept': 'audio/mpeg',
    //                 'Content-Type': 'application/json',
    //                 'xi-api-key': apiKey,
    //             },
    //             body: JSON.stringify({
    //                 text,
    //                 model_id: 'eleven_multilingual_v2',
    //                 output_format: 'mp3_44100_128',
    //             }),
    //         });
    //         if (!response.ok) throw new Error('Failed to fetch audio from ElevenLabs');
    //         const audioBlob = await response.blob();
    //         const audioUrl = URL.createObjectURL(audioBlob);
    //         if (audioRef.current) {
    //             await new Promise<void>((resolve) => {
    //                 audioRef.current!.src = audioUrl;
    //                 audioRef.current!.onended = () => {
    //                     resolve(); // No delay between phrases
    //                 };
    //                 audioRef.current!.play();
    //             });
    //         } else {
    //             // fallback: just wait
    //             await new Promise(res => setTimeout(res, 1000));
    //         }
    //     }
    //     setIsBotSpeaking(false);
    //     if (onEnd) onEnd();
    // } catch (error) {
    //     console.error('TTS error:', error);
    //     setIsBotSpeaking(false);
    //     if (onEnd) onEnd();
    // }
    // };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (currentIndex >= 0 && timeLeft > 0 && !isRecording) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isRecording) {
            handleSubmit();
        }
        return () => clearInterval(timer);
    }, [timeLeft, currentIndex, isRecording]);

    // Fisher-Yates shuffle for jumbled TTS
    function getJumbledPhrases(phrases: string[]): string[] {
        let jumbled = [...phrases];
        let attempts = 0;
        do {
            for (let i = jumbled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [jumbled[i], jumbled[j]] = [jumbled[j], jumbled[i]];
            }
            attempts++;
        } while (jumbled.join(' ') === phrases.join(' ') && attempts < 10);
        return jumbled;
    }

    // Remove the duplicate TTS playback - we'll only use the audio files
    // useEffect(() => {
    //     if (currentIndex >= 0 && currentRoundSentences.length > 0) {
    //         setIsRecordingPhase(false);
    //         setRecordingTimer(10);
    //         const jumbled = getJumbledPhrases(currentRoundSentences[currentIndex].phrases);
    //         speakJumbledWithDelay(jumbled, () => {
    //             setIsRecordingPhase(true);
    //             setRecordingTimer(10);
    //         });
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [currentIndex]);

    // Start/stop the 10s timer for user recording
    useEffect(() => {
        if (isRecordingPhase) {
            // Start recording automatically
            startRecording('', false);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(recordingTimerRef.current!);
                        stopRecording();
                        setIsRecordingPhase(false);
                        setTimeout(moveToNextQuestion, 500); // Short pause before next
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        }
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecordingPhase]);

    // In startTest, set currentIndex to 0 (not -1) so the first sentence UI is shown after the audio:
    const startTest = () => {
        if (!ALL_SENTENCES || ALL_SENTENCES.length === 0) {
            console.error('No sentences available');
            return;
        }
        if (onStart) {
            onStart();
        }
        // Select 10 unique random indices
        const indices = getRandomIndices(AVAILABLE_JUMBLED_FILES.length, 10);
        const randomAudios = indices.map(i => AVAILABLE_JUMBLED_FILES[i]);
        const randomSentences = indices.map(i => ALL_SENTENCES[i]);
        setSelectedAudioFiles(randomAudios);
        setCurrentAudioIndex(0);
        setIsAudioPlaying(true);
        setCurrentRoundSentences(randomSentences);
        setCurrentIndex(0); // Show the first sentence after audio
        setTimeLeft(10);
        setSelectedPhrases([]);
        setAvailablePhrases([]);
        setResults([]);
    };

    const moveToNextQuestion = () => {
        if (!selectedAudioFiles || selectedAudioFiles.length === 0) {
            console.error('No audio files available');
            return;
        }
        const nextIndex = currentAudioIndex + 1;
        if (nextIndex >= selectedAudioFiles.length) {
            onComplete(results);
            return;
        }
        setCurrentAudioIndex(nextIndex);
        setIsAudioPlaying(true);
        setCurrentIndex(nextIndex); // Advance to the next sentence
        setTimeLeft(10);
        setSelectedPhrases([]);
        setAvailablePhrases([]);
        setFeedback({ show: false, correct: false });
        setUserAudioUrl(null);
        setIsRecording(false);
    };

    const handlePhraseClick = (phrase: string, index: number) => {
        setSelectedPhrases(prev => [...prev, phrase]);
        setAvailablePhrases(prev => prev.filter((_, i) => i !== index));
        const newSelected = [...selectedPhrases, phrase];
        if (newSelected.length === currentRoundSentences[currentIndex].phrases.length) {
            const userSentence = newSelected.join(' ');
            const isCorrect = checkOrder(newSelected);
            setFeedback({ show: true, correct: isCorrect });
            // Do not push to results yet, wait for audio
            setTimeout(() => {
                // After feedback, allow recording
                startRecording(userSentence, isCorrect);
            }, 1000);
        }
    };

    const checkOrder = (selected: string[]): boolean => {
        const currentSentence = currentRoundSentences[currentIndex];
        return selected.join(' ') === currentSentence.correct;
    };

    const handleSubmit = () => {
        if (!currentRoundSentences || currentIndex < 0 || currentIndex >= currentRoundSentences.length) {
            console.error('Invalid state for submission');
            return;
        }
        const userSentence = selectedPhrases.join(' ');
        const isCorrect = checkOrder(selectedPhrases);
        setFeedback({ show: true, correct: isCorrect });
        setResults(prev => [...prev, {
            attempted: userSentence,
            correct: isCorrect,
            correctSentence: currentRoundSentences[currentIndex].correct,
            userSentence: userSentence
        }]);
        setTimeout(moveToNextQuestion, 1000);
    };

    const handleRetake = () => {
        setCurrentIndex(-1);
        setResults([]);
        setSelectedPhrases([]);
        setAvailablePhrases([]);
        setCurrentRoundSentences([]);
        setFeedback({ show: false, correct: false });
    };

    const calculateScore = () => {
        const correctAnswers = results.filter(result => result.correct).length;
        return {
            correct: correctAnswers,
            total: currentRoundSentences.length,
            percentage: Math.round((correctAnswers / currentRoundSentences.length) * 100)
        };
    };

    // Recording logic
    const startRecording = async (userSentence: string, isCorrect: boolean) => {
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
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    // Get transcription from react-speech-recognition
                    const currentTranscript = transcript.trim();
                    console.log('Current transcript:', currentTranscript);
                    console.log('Current index:', currentIndex);

                    if (currentTranscript) {
                        console.log('Setting transcription for index', currentIndex, ':', currentTranscript);
                        setTranscriptions(prev => ({
                            ...prev,
                            [currentIndex]: currentTranscript
                        }));

                        // Update the results with the transcript
                        setResults(prev => {
                            const updatedResults = prev.map((result, idx) =>
                                idx === currentIndex
                                    ? { ...result, transcript: currentTranscript }
                                    : result
                            );
                            console.log('Updated results with transcript:', updatedResults);
                            return updatedResults;
                        });
                    }

                    // Add result only after audio is available
                    setResults(prev => [...prev, {
                        attempted: userSentence,
                        correct: isCorrect,
                        correctSentence: currentRoundSentences[currentIndex].correct,
                        userSentence: userSentence,
                        audioBlob,
                        audioUrl,
                        transcript
                    }]);
                    // Clean up the stream
                    stream.getTracks().forEach(track => track.stop());
                }
            };
            mediaRecorder.start();
            setIsRecording(true);

            // Start speech recognition
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        } catch (err) {
            alert('Could not start recording. Please allow microphone access.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Clean up the stream
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }

        // Stop speech recognition
        SpeechRecognition.stopListening();
    };

    // After recording, move to next question
    useEffect(() => {
        if (userAudioUrl && !isRecording) {
            setTimeout(moveToNextQuestion, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAudioUrl, isRecording]);

    // In the audio playback effect, after audio ends, set available phrases for the sentence:
    useEffect(() => {
        if (isAudioPlaying && currentAudioIndex >= 0 && currentAudioIndex < selectedAudioFiles.length) {
            const audioPath = `/speechmaa/Jumbled_sentence/${selectedAudioFiles[currentAudioIndex]}`;
            if (audioRef.current) {
                // Clear any existing event listeners
                audioRef.current.onerror = null;
                audioRef.current.onended = null;

                // Add error handling
                audioRef.current.onerror = (e) => {
                    console.error('Audio loading error:', e);
                    console.error('Failed to load audio file:', audioPath);
                    // Skip to next audio if current one fails
                    moveToNextQuestion();
                };

                audioRef.current.src = audioPath;
                audioRef.current.onended = () => {
                    console.log('Audio ended, starting recording phase');
                    setIsAudioPlaying(false);
                    setCurrentIndex(currentAudioIndex); // Now show the UI for this index
                    if (currentRoundSentences[currentAudioIndex]) {
                        setAvailablePhrases(currentRoundSentences[currentAudioIndex].phrases);
                    }
                    setIsRecordingPhase(true);
                    setRecordingTimer(10);
                };

                // Add a small delay to ensure the audio element is ready
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.play().catch(error => {
                            console.error('Error playing audio:', error);
                            moveToNextQuestion();
                        });
                    }
                }, 100);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAudioIndex, isAudioPlaying]);

    // Remove auto-start - let user click start button like other rounds
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         startTest();
    //     }, 2000);
    //     return () => clearTimeout(timer);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-8 font-['Inter']">
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
                <h1 className="text-4xl font-bold mb-4">Round 3 - Sentence Build</h1>
                <p className="text-lg text-gray-300 max-w-2xl">
                    Listen to the AI carefully. After it speaks, you have 10 seconds to say the correct sentence aloud.
                </p>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-3xl">
                {currentIndex === -1 ? (
                    <div className="text-center space-y-8">
                        <div className="bg-[#1e293b] rounded-lg p-8">
                            <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
                            <ul className="text-left space-y-4 text-gray-300">
                                <li className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-sm">1</div>
                                    <span>The AI will speak a jumbled sentence. Listen carefully.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-sm">2</div>
                                    <span>After the AI finishes, you have 10 seconds to say the correct sentence aloud.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-sm">3</div>
                                    <span>After 10 seconds, the next sentence will start automatically.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-sm">4</div>
                                    <span>Complete all sentences to finish the test.</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={startTest}
                            className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Play className="w-6 h-6" />
                            Start Test
                        </button>
                    </div>
                ) : isAudioPlaying && currentAudioIndex >= 0 ? (
                    <div className="bg-gradient-to-r from-[#1e293b] to-[#2d3a4f] rounded-xl p-8 shadow-xl border border-[#334155] flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                            Sentence {currentAudioIndex + 1} of {selectedAudioFiles.length}
                        </h2>
                        <p className="text-lg text-gray-300 mb-2">Playing jumbled sentence audio...</p>
                        <audio ref={audioRef} hidden />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-gradient-to-r from-[#1e293b] to-[#2d3a4f] rounded-xl p-8 shadow-xl border border-[#334155] flex flex-col items-center">
                            <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                                Sentence {currentIndex + 1} of {currentRoundSentences.length}
                            </h2>
                            <p className="text-lg text-gray-300 mb-2">Listen to the AI and then speak the correct sentence.</p>
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-gray-400 mb-2">{isRecordingPhase ? 'Recording...' : 'Waiting for AI...'}</span>
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
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="45"
                                                stroke="url(#gradient)"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={2 * Math.PI * 45}
                                                strokeDashoffset={2 * Math.PI * 45 * (1 - recordingTimer / 10)}
                                                className="transition-all duration-1000 ease-linear"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-3xl font-bold">{recordingTimer}</span>
                                        </div>
                                    </div>
                                </div>
                                {userAudioUrl && (
                                    <div className="flex flex-col items-center gap-4 mt-4">
                                        <audio controls src={userAudioUrl} className="w-full max-w-xs" />
                                        <span className="text-green-400">Recording saved!</span>
                                    </div>
                                )}
                                <audio ref={audioRef} hidden />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Progress Indicator */}
            {currentIndex >= 0 && (
                <div className="mt-8 text-gray-400">
                    Sentence {currentIndex + 1} of {currentRoundSentences.length}
                </div>
            )}
        </div>
    );
};

export default SentenceBuild;






