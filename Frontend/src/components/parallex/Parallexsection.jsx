// @ts-nocheck
import React, { useEffect, useState } from "react";
import './ParallaxSection.css';
import { Outlet } from 'react-router-dom'
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

    const vh = window.innerHeight;
    const totalSections = images.length;
    const sectionHeight = vh;
    const totalHeight = sectionHeight * (totalSections - 1);
    const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);

    const getOpacity = (index) => {
        const sectionProgress = (scrollY - index * sectionHeight) / sectionHeight;
        if (sectionProgress < 0) return 0;
        if (sectionProgress > 1) return 0;
        return 1 - Math.abs(sectionProgress - 0.5) * 2;
    };

    // Opacity for the initial text: fully visible at top, fades out as first image fades in
    const textOpacity = 1 - Math.min(scrollY / sectionHeight, 1);

    return (
        <div className="relative w-full" style={{ height: `${totalSections * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full flex items-center justify-center">
                {/* Initial text overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        opacity: textOpacity,
                        transition: 'opacity 0.7s ease',
                        pointerEvents: 'none',
                        background: 'transparent',
                    }}
                >
                    <span style={{
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                        fontWeight: 700,
                        color: '#222',
                        letterSpacing: '0.05em',
                        textShadow: '0 2px 16px rgba(0,0,0,0.08)',
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: '1rem',
                        padding: '1rem 2.5rem',
                    }}>
                        Interview Eval8 .ai
                    </span>
                </div>
                <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center">
                    {images.map((src, idx) => (
                        <div
                            key={src}
                            className="parallax-image-wrapper"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                zIndex: 10 + idx,
                                opacity: getOpacity(idx),
                                transition: 'opacity 0.7s ease',
                            }}
                        >
                            <img
                                src={src}
                                alt={`parallax-${idx}`}
                                className="parallax-image"
                                style={{
                                    width: '90vw',
                                    maxWidth: '600px',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                    borderRadius: '1.5rem',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                                    background: '#fff',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Parallaxsection;
