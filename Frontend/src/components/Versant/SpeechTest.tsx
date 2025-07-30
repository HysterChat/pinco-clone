import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SpeechTest: React.FC = () => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        setIsListening(true);
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
        setIsListening(false);
    };

    if (!browserSupportsSpeechRecognition) {
        return <div>Browser doesn't support speech recognition.</div>;
    }

    return (
        <div className="p-8 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Speech Recognition Test</h1>

            <div className="mb-4">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`px-4 py-2 rounded ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
            </div>

            <div className="mb-4">
                <p>Listening: {listening ? 'Yes' : 'No'}</p>
                <p>Is Listening: {isListening ? 'Yes' : 'No'}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
                <p>{transcript || 'No transcript yet...'}</p>
            </div>

            <button
                onClick={resetTranscript}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Reset Transcript
            </button>
        </div>
    );
};

export default SpeechTest; 