import React from 'react';
import Footer from './Footer';

const TermsAndService = () => {
    return (
        <>
            <div className="min-h-screen bg-[#C5CAE9]/30 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h1 className="text-3xl font-bold text-[#1E1B4B] mb-6">Terms of Service</h1>
                        <p className="text-slate-500 mb-8">Last updated: April 23, 2025</p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">1. Introduction</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Welcome to Hirevio ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the Hirevio website, applications, and services (collectively, the "Services").
                                </p>
                                <p className="text-slate-600 leading-relaxed mt-4">
                                    By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">2. User Accounts</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    You may be required to create an account to access certain features of our Services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                                </p>
                                <p className="text-slate-600 leading-relaxed mt-4">
                                    You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">3. Acceptable Use</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">You agree not to use the Services to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                    <li>Violate any applicable law or regulation</li>
                                    <li>Infringe upon the rights of others</li>
                                    <li>Distribute viruses, malware, or other harmful code</li>
                                    <li>Interfere with or disrupt the Services</li>
                                    <li>Engage in any activity that could damage, disable, or impair the Services</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">4. Intellectual Property</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are owned by Hirevio or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">5. Limitation of Liability</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    To the maximum extent permitted by law, in no event shall Hirevio be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">6. Changes to Terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to modify these Terms at any time. If we make changes, we will provide notice by updating the date at the top of these Terms and, in some cases, we may provide additional notice. Your continued use of the Services after the changes are made constitutes your acceptance of the updated Terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">7. Termination</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We may terminate or suspend your account and access to the Services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Services, us, or third parties, or for any other reason.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">8. Contact Information</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have any questions about these Terms, please contact us at:
                                </p>
                                <div className="mt-4 text-slate-600">
                                    <p>Email: <a href="mailto:talent@hirevio.in" className="text-indigo-600 hover:text-indigo-700">talent@hirevio.in</a></p>
                                    <p className="mt-2">
                                        Address: E-1, Beech, MANYATA EMBASSY BUSINESS PARK, Ground Floor, Outer Ring Rd, Nagavara, Bengaluru, Karnataka 560045, India
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

export default TermsAndService; 
