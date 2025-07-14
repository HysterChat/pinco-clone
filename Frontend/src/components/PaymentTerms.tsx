import React from 'react';
import Footer from './Footer';

const PaymentTerms = () => {
    return (
        <>
            <div className="min-h-screen bg-[#C5CAE9]/30 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h1 className="text-3xl font-bold text-[#1E1B4B] mb-6">Payment Terms</h1>
                        <p className="text-slate-500 mb-8">Last updated: April 23, 2025</p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">1. Introduction</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    These Payment Terms govern all payments made to Hirevio ("we," "our," or "us") for the use of our services. By making a payment, you agree to these Payment Terms and our Terms of Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">2. Pricing and Payment</h2>
                                <ul className="space-y-3 text-slate-600">
                                    <li><span className="font-medium">Currency:</span> All prices are in Indian Rupees (INR) unless otherwise specified.</li>
                                    <li><span className="font-medium">Payment Methods:</span> We accept payment via credit cards, debit cards, UPI, and other electronic payment methods as indicated on our website.</li>
                                    <li><span className="font-medium">Taxes:</span> All prices displayed include applicable taxes unless otherwise stated.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">3. Subscription Plans</h2>
                                <ul className="space-y-3 text-slate-600">
                                    <li><span className="font-medium">Billing Cycle:</span> Subscription plans are billed in advance on either a monthly or annual basis, depending on the plan you select.</li>
                                    <li><span className="font-medium">Auto-Renewal:</span> Your subscription will automatically renew at the end of each billing period unless you cancel it prior to the renewal date.</li>
                                    <li><span className="font-medium">Price Changes:</span> We may change the price of our subscription plans. If we do, we will provide notice at least 30 days before the change takes effect. Your continued use of the service after the price change constitutes your agreement to pay the new price.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">4. Cancellation and Refunds</h2>
                                <ul className="space-y-3 text-slate-600">
                                    <li><span className="font-medium">Cancellation:</span> You can cancel your subscription at any time through your account settings or by contacting customer support. After cancellation, your subscription will remain active until the end of the current billing period.</li>
                                    <li><span className="font-medium">Refunds:</span> Our refund policy is outlined in our separate Refund Policy document.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">5. Free Trials</h2>
                                <ul className="space-y-3 text-slate-600">
                                    <li><span className="font-medium">Trial Period:</span> We may offer free trial periods for our subscription plans. At the end of the trial period, your account will automatically be charged for the subscription unless you cancel before the trial ends.</li>
                                    <li><span className="font-medium">Eligibility:</span> Free trials are available to new users only, unless otherwise specified. We reserve the right to determine eligibility for free trials.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">6. Payment Security</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We implement appropriate technical and organizational measures to protect your payment information. We do not store your complete credit card information on our servers. All payment transactions are processed through secure and PCI-compliant payment processors.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">7. Disputed Charges</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you believe that you have been charged incorrectly, please contact us at talent@hirevio.in within 30 days of the charge. We will review your concerns and work to resolve any legitimate issues promptly.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">8. Changes to These Payment Terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We reserve the right to modify these Payment Terms at any time. If we make material changes, we will provide notice by updating the date at the top of these terms and, in some cases, we may provide additional notice.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-[#1E1B4B] mb-4">9. Contact Us</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    If you have any questions about these Payment Terms, please contact us at:
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

export default PaymentTerms; 
