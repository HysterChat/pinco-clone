import React, { useEffect, useState } from "react";
import './ParallaxSection.css';

const images = [
    "/Struggle.png",
    "/InterviewPreparation.png",
    "/GotPlaced.png"
];

const Parallaxsection = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Calculate progress between 0 and 1 for each image transition
    const vh = window.innerHeight;
    const totalSections = images.length;
    const sectionHeight = vh; // Each image gets one viewport height
    const totalHeight = sectionHeight * (totalSections - 1);
    const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);

    // Calculate opacity for each image
    const getOpacity = (index) => {
        const sectionProgress = (scrollY - index * sectionHeight) / sectionHeight;
        if (sectionProgress < 0) return 0;
        if (sectionProgress > 1) return 0;
        return 1 - Math.abs(sectionProgress - 0.5) * 2; // fade in/out
    };

    return (
        <div className="relative w-full" style={{ height: `${totalSections * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full">
                <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center">
                    {images.map((src, idx) => (
                        <img
                            key={src}
                            src={src}
                            alt={`parallax-${idx}`}
                            className="parallax-image"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: getOpacity(idx),
                                transition: 'opacity 0.7s ease',
                                pointerEvents: 'none',
                                zIndex: 10 + idx
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Parallaxsection;
