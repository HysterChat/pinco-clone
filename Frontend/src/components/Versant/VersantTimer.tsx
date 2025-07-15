import React from 'react';
import { Clock } from 'lucide-react';

interface VersantTimerProps {
    seconds: number;
}

const VersantTimer: React.FC<VersantTimerProps> = ({ seconds }) => {
    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const progress = (seconds / (30 * 60)) * 100; // Assuming 30 minutes total time
    const strokeDasharray = 2 * Math.PI * 45; // Circle circumference

    return (
        <div className="fixed top-4 left-4 bg-[#1e293b] rounded-2xl p-4 shadow-lg border border-[#334155] flex items-center gap-4">
            <div className="relative w-16 h-16">
                <svg className="transform -rotate-90 w-full h-full">
                    {/* Background circle */}
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#334155"
                        strokeWidth="6"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="url(#timerGradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDasharray * (1 - progress / 100)}
                        className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-white font-mono">
                    {formatTime(seconds)}
                </span>
                <span className="text-sm text-gray-400">
                    Time Elapsed
                </span>
            </div>
        </div>
    );
};

export default VersantTimer; 






