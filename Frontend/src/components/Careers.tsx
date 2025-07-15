import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Briefcase, Clock, Users, Heart, GraduationCap, DollarSign } from 'lucide-react';
import Footer from './Footer';

const JobCard = ({ title, department, location, type, link = "#" }: {
    title: string;
    department: string;
    location: string;
    type: string;
    link?: string;
}) => (
    <a
        href={link}
        className="block p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors duration-200"
    >
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">{title}</h3>
                <p className="text-sm text-[#1E1B4B]/70">
                    {department} · {location} · {type}
                </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#4F46E5]" />
        </div>
    </a>
);

const BenefitCard = ({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <div className="bg-white rounded-xl p-6">
        <div className="mb-4 text-[#4F46E5]">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-2">{title}</h3>
        <p className="text-[#1E1B4B]/70 text-sm">{description}</p>
    </div>
);

const Careers = () => {
    return (
        <>
            <div className="min-h-screen bg-secondary/30">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl font-bold text-primary mb-3">
                            Join Our Team
                        </h1>
                        <p className="text-primary/80">
                            Help us transform how job seekers prepare for interviews and build their careers.
                        </p>
                    </div>

                    {/* Why Work at eval8 ai */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Why Work at eval8 ai</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6">
                                <div className="mb-4">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Impactful Work</h3>
                                <p className="text-primary/80 text-sm">
                                    Help thousands of job seekers improve their lives by landing better jobs and building fulfilling careers.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6">
                                <div className="mb-4">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Work-Life Balance</h3>
                                <p className="text-primary/80 text-sm">
                                    Flexible schedule, remote work options, and generous time off to ensure you can be your best self at work and home.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6">
                                <div className="mb-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">Diverse Team</h3>
                                <p className="text-primary/80 text-sm">
                                    Join a team with diverse backgrounds, perspectives, and experiences, united by a shared mission.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Our Benefits */}
                    <div className="bg-primary/10 rounded-xl p-8 mb-16">
                        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Our Benefits</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-start gap-3 mb-4">
                                    <Heart className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-primary mb-1">Comprehensive Health Insurance</h3>
                                        <p className="text-sm text-primary/80">Medical, dental, and vision coverage for you and your dependents.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-primary mb-1">Remote Work Options</h3>
                                        <p className="text-sm text-primary/80">Flexibility to work from anywhere for most positions.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-start gap-3 mb-4">
                                    <GraduationCap className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-primary mb-1">Learning & Development</h3>
                                        <p className="text-sm text-primary/80">Annual stipend for professional development and continuous learning.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <DollarSign className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-primary mb-1">Equity Compensation</h3>
                                        <p className="text-sm text-primary/80">Share in our success with equity options for all full-time employees.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Openings */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-primary mb-6">Current Openings</h2>
                        <div className="space-y-4">
                            <JobCard
                                title="AI Engineer"
                                department="Engineering"
                                location="Bangalore"
                                type="Remote Option · Full-time"
                            />
                            <JobCard
                                title="Frontend Developer"
                                department="Engineering"
                                location="Bangalore"
                                type="Remote Option · Full-time"
                            />
                            <JobCard
                                title="Content Specialist"
                                department="Marketing"
                                location="Remote"
                                type="Full-time"
                            />
                            <JobCard
                                title="HR Specialist"
                                department="People Operations"
                                location="Bangalore"
                                type="Part-time"
                            />
                        </div>
                    </div>

                    {/* Don't see the right position */}
                    <div className="bg-primary/20 rounded-xl p-8 text-center">
                        <h3 className="text-xl font-bold text-primary mb-2">
                            Don't see the right position?
                        </h3>
                        <p className="text-primary/80 mb-6">
                            We're always looking for talented individuals. Send your resume to careers@eval8 ai.com with a brief note about why you'd be great for our team.
                        </p>
                        <Button
                            className="bg-primary hover:bg-black text-white"
                        >
                            Contact Us
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Careers;






