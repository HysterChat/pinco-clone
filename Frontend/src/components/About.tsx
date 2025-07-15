import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Star, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-primary-950 py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-bold text-white mb-3">
                        About eval8 ai
                    </h1>
                    <p className="text-white/80">
                        We're on a mission to help job seekers land their dream jobs by transforming how they prepare for interviews.
                    </p>
                </div>

                {/* Our Story */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6">Our Story</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4 text-white/80">
                            <p>
                                eval8 ai was founded in 2022 by a team of AI specialists, career coaches, and HR professionals who recognized a gap in the job market: while countless resources existed for resume building and job searching, there wasn't an effective solution for the most critical part of the process - interview preparation.
                            </p>
                            <p>
                                We observed that many qualified candidates were missing out on opportunities not because they lacked skills, but because they struggled to present themselves effectively in interviews. This observation led to the creation of eval8 ai - an AI-powered interview coach that provides personalized practice, feedback, and guidance.
                            </p>
                            <p>
                                Today, eval8 ai helps thousands of job seekers across India prepare for interviews with confidence, leading to better outcomes and successful careers.
                            </p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-white font-semibold">P</span>
                                </div>
                                <h3 className="text-lg font-semibold text-primary">eval8 ai</h3>
                            </div>
                            <p className="text-primary/80 italic">
                                "We believe everyone deserves access to high-quality interview preparation tools that adapt to their unique needs and goals."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission & Values */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Our Mission & Values</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6">
                            <div className="mb-4">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary mb-2">Mission</h3>
                            <p className="text-primary/80">
                                To democratize access to high-quality interview preparation tools and empower job seekers to reach their full potential.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6">
                            <div className="mb-4">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary mb-2">Excellence</h3>
                            <p className="text-primary/80">
                                We're committed to providing the most realistic interview simulations and the most helpful feedback possible.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6">
                            <div className="mb-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary mb-2">Inclusivity</h3>
                            <p className="text-primary/80">
                                We design our platform to be accessible and helpful to job seekers from all backgrounds, industries, and experience levels.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-16 bg-primary/20 rounded-xl p-8 text-center">
                    <h3 className="text-xl font-bold text-primary mb-2">
                        Ready to join our community?
                    </h3>
                    <p className="text-primary/80 mb-6">
                        Take the first step toward interview success with eval8 ai's AI-powered interview coach.
                    </p>
                    <Button
                        asChild
                        className="bg-primary hover:bg-orange-500 text-white"
                    >
                        <Link to="/signup">Get Started for free →</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default About;






