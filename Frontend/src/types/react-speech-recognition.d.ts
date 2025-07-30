declare module 'react-speech-recognition' {
    export interface SpeechRecognitionOptions {
        continuous?: boolean;
        interimResults?: boolean;
        language?: string;
        maxAlternatives?: number;
    }

    export interface SpeechRecognitionState {
        transcript: string;
        listening: boolean;
        browserSupportsSpeechRecognition: boolean;
        resetTranscript: () => void;
    }

    export function useSpeechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionState;

    export default class SpeechRecognition {
        static startListening(options?: SpeechRecognitionOptions): void;
        static stopListening(): void;
        static abortListening(): void;
    }
} 