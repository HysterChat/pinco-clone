import React from 'react';
import Footer from './Footer';

const RefundPolicy = () => {
    return (
        <>
            <div className="min-h-screen bg-[#C5CAE9]/30 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h1 className="text-3xl font-bold text-[#1E1B4B] mb-6">Refund Policy</h1>
                        <p className="text-slate-500 mb-8">Last updated: April 23, 2025</p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">1. Introduction</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    This Refund Policy explains how and when you can request a refund for services purchased from eval8 ai ("we," "our," or "us"). By using our services, you agree to the terms of this Refund Policy.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">2. Subscription Services</h2>
                                <ul className="space-y-3 text-slate-600">
                                    <li><span className="font-medium">Free Trial:</span> If you cancel your subscription during the free trial period, you will not be charged.</li>
                                    <li><span className="font-medium">Monthly Subscriptions:</span> For monthly subscription plans, we provide refunds if requested within 7 days of the initial purchase or the most recent renewal date. After this period, we do not offer prorated refunds for the remainder of the subscription period.</li>
                                    <li><span className="font-medium">Annual Subscriptions:</span> For annual subscription plans, we provide refunds if requested within 14 days of the initial purchase or renewal date. After this period, we may offer a prorated refund at our discretion.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">3. One-Time Purchases</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    For one-time purchases of digital content or services, we offer refunds if requested within 14 days of purchase, provided that the service has not been substantially consumed or used.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">4. Requesting a Refund</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    To request a refund, please contact our customer support team at talent@eval8 ai.ai. Please include your account information, the name of the service purchased, and the reason for your refund request.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    We will review your request and respond within 5 business days. If your refund is approved, it will be processed within 14 business days. The refund will be issued to the original payment method used for the purchase.
                                </p>
                            </section>


                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">5. Exclusions</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">We do not offer refunds in the following cases:</p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                    <li>After the refund period has expired</li>
                                    <li>If you have violated our Terms of Service</li>
                                    <li>For purchases made with promotional codes or discounts</li>
                                    <li>For any technical issues that are not directly attributable to eval8 ai</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">6. Changes to This Policy</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to modify this Refund Policy at any time. If we make material changes, we will provide notice by updating the date at the top of this policy and, in some cases, we may provide additional notice.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">7. Contact Us</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have any questions about this Refund Policy, please contact us at:
                                </p>
                                <div className="mt-4 text-slate-600">
                                    <p>Email: <a href="mailto:talent@eval8 ai.ai" className="text-indigo-600 hover:text-indigo-700">talent@eval8 ai.ai</a></p>
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

export default RefundPolicy; 






