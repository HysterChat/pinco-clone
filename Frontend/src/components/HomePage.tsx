import React from 'react';
import Carousel from './Carousel';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Footer from './Footer';

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <section id="hero" className="scroll-mt-20">
                    <Carousel />
                </section>
                <section id="features" className="scroll-mt-20">
                    <Features />
                </section>
                <section id="how-it-works" className="scroll-mt-20">
                    <HowItWorks />
                </section>
                <section id="pricing" className="scroll-mt-20">
                    <Pricing />
                </section>
                {/* <section id="testimonials" className="scroll-mt-20">
                    <Testimonials />
                </section> */}
            </main>
            <Footer />
        </div>
    );
};

export default HomePage; 