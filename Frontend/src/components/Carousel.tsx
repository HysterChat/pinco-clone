import React, { useState, useEffect } from 'react';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}


const carouselData: CarouselItem[] = [
  {
    id: 1,
    title: "Confidence Cracks When It Matters Most?",
    description: "You've prepared for days, but the words don't come out. eval8 ai helps you stay calm and speak clearly.",
    ctaText: "Practice With AI and Get Comfortable",
    ctaLink: "/signup",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
  },
  {
    id: 2,
    title: "No Feedback. No Clarity. Just Silence.",
    description: "Rejections without explanation leave you guessing. eval8 ai tells you exactly what went wrong—instantly.",
    ctaText: "Get Your Interview Report Card",
    ctaLink: "/signup",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    title: "Struggling to Speak in English During Interviews?",
    description: "eval8 ai helps you build fluency and confidence without pressure. Practice daily and see the change.",
    ctaText: " Improve Your Communication Now",
    ctaLink: "/signup",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 4,
    title: "Mock Interviews Are the Real Deal Here.",
    description: "Practice unlimited AI interviews—so your first real interview won't be your first.",
    ctaText: " Take Your First Mock Interview",
    ctaLink: "/signup",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 5,
    title: "Cracking the Resume Round Is Just the Beginning",
    description: "A great resume opens the door. Your interview performance keeps it open. Practice both with eval8 ai.",
    ctaText: "Train With eval8 ai Like a Pro",
    ctaLink: "/signup",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  }
];

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselData.map((item) => (
          <div
            key={item.id}
            className="min-w-full h-full relative"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-5xl mx-auto">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {item.title}
                </h2>
                <p className="text-xl md:text-2xl lg:text-3xl mb-10 leading-relaxed max-w-4xl mx-auto">
                  {item.description}
                </p>
                <a
                  href={item.ctaLink}
                  className="inline-block bg-primary hover:bg-primary-dark text-white text-xl md:text-2xl font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  {item.ctaText}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white w-14 h-14 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white w-14 h-14 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {carouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${currentSlide === index
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel; 





