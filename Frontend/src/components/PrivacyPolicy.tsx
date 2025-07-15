import React from 'react';
import Footer from './Footer';

const PrivacyPolicy = () => {
    return (
        <>
            <div className="min-h-screen bg-[#C5CAE9]/30 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h1 className="text-3xl font-bold text-[#1E1B4B] mb-6">Privacy Policy</h1>
                        <p className="text-slate-500 mb-8">Last updated: April 23, 2025</p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">1. Introduction</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    At eval8 ai, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Services").
                                </p>
                                <p className="text-slate-600 leading-relaxed mt-4">
                                    Please read this Privacy Policy carefully. By accessing or using our Services, you agree to the terms of this Privacy Policy and our Terms of Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">2. Information We Collect</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">We may collect the following types of information:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                    <li><span className="font-medium">Personal Information:</span> Such as your name, email address, phone number, and other information you provide when creating an account or using our Services.</li>
                                    <li><span className="font-medium">Usage Information:</span> Such as how you use our Services, the features you interact with, and the time spent on our platform.</li>
                                    <li><span className="font-medium">Device Information:</span> Such as your IP address, browser type, operating system, and device identifiers.</li>
                                    <li><span className="font-medium">Interview Data:</span> Such as recordings, transcripts, and feedback from practice interviews conducted on our platform.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">3. How We Use Your Information</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">We may use the information we collect for various purposes, including to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                    <li>Provide, maintain, and improve our Services</li>
                                    <li>Personalize your experience and deliver content relevant to your interests</li>
                                    <li>Communicate with you about our Services, updates, and promotions</li>
                                    <li>Analyze usage patterns and optimize our Services</li>
                                    <li>Protect against, identify, and prevent fraud and other illegal activity</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">4. Information Sharing and Disclosure</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">We may share your information with:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                    <li><span className="font-medium">Service Providers:</span> Third-party vendors who perform services on our behalf.</li>
                                    <li><span className="font-medium">Legal Requirements:</span> When required by law or in response to legal process.</li>
                                    <li><span className="font-medium">Business Transfers:</span> In connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">5. Data Security</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We implement appropriate technical and organizational measures to protect your information against unauthorized access, disclosure, alteration, and destruction. However, no data transmission or storage system is 100% secure, and we cannot guarantee the security of your information.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">6. Your Rights</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                    <li>The right to access your personal information</li>
                                    <li>The right to correct inaccurate or incomplete information</li>
                                    <li>The right to delete your personal information</li>
                                    <li>The right to restrict or object to processing of your personal information</li>
                                    <li>The right to data portability</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">7. Changes to This Privacy Policy</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We may update this Privacy Policy from time to time. If we make material changes, we will provide notice by updating the date at the top of this Privacy Policy and, in some cases, we may provide additional notice.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">8. Contact Us</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us at:
                                </p>
                                <div className="mt-4 text-slate-600">
                                    <p>Email: <a href="mailto:gokul@hysteresis.in" className="text-indigo-600 hover:text-indigo-700">gokul@hysteresis.in</a></p>
                                    <p className="mt-2">
                                        Address: Office 2, 1st Floor, 32nd Cross Rd, 4th T Block East, 4th Block, Jayanagar, Bengaluru, Karnataka 560041, India
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy; 






