import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A1B3F]">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-[#2D7CFF]/20"></div>
                <div className="w-12 h-12 rounded-full border-4 border-[#2D7CFF] border-t-transparent animate-spin absolute top-0"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner; 





