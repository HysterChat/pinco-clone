import React from 'react';
import { Mail, MapPin, Clock } from 'lucide-react';
import Footer from './Footer';

const Contact = () => {
    return (
        <>
            <div className="min-h-screen bg-secondary/30">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-center text-primary mb-12">
                        Contact Us
                    </h1>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div>
                            <h2 className="text-xl font-bold text-primary mb-2">
                                Get in Touch
                            </h2>
                            <p className="text-primary/80 mb-8">
                                Have a question or want to learn more about our services? We're here to help.
                            </p>

                            <div className="space-y-6">
                                {/* Email */}
                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 text-primary/80 mt-1" />
                                    <div className="ml-3">
                                        <h3 className="text-primary font-medium">Email</h3>
                                        <a href="mailto:info@eval8 ai.ai" className="text-primary/80">
                                            info@eval8 ai.ai
                                        </a>
                                    </div>
                                </div>

                                {/* Office */}
                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-primary/80 mt-1" />
                                    <div className="ml-3">
                                        <h3 className="text-primary font-medium">Office</h3>
                                        <address className="text-primary/80 not-italic">
                                            E-1, Beech, MANYATA EMBASSY BUSINESS PARK<br />
                                            Ground Floor, Outer Ring Rd<br />
                                            Nagavara, Bengaluru, Karnataka 560045<br />
                                            India
                                        </address>
                                    </div>
                                </div>

                                {/* Office Hours */}
                                <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-primary/80 mt-1" />
                                    <div className="ml-3">
                                        <h3 className="text-primary font-medium">Office Hours</h3>
                                        <p className="text-primary/80">
                                            Monday - Friday<br />
                                            9:00 AM - 6:00 PM IST
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Map */}
                        <div className="bg-white rounded-xl p-6">
                            <h2 className="text-xl font-bold text-primary mb-4">
                                Our Location
                            </h2>
                            <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                                <iframe
                                    title="eval8 ai Office Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.0832770761837!2d77.61693067573567!3d13.030973887288392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17c5c2b0d1fb%3A0x1cf1c40b96d3d7c4!2sManyata%20Embassy%20Business%20Park!5e0!3m2!1sen!2sin!4v1709747547744!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="rounded-lg"
                                ></iframe>
                                <a
                                    href="https://www.google.com/maps/place/Manyata+Embassy+Business+Park"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 left-2 bg-primary px-3 py-1 rounded text-sm text-white"
                                >
                                    View larger map
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Contact;






