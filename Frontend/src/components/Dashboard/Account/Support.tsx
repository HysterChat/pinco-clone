import React from 'react';
import { MessageCircle, Mail, Phone, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const Support = () => {
    const faqs = [
        {
            question: "How do I prepare for my first interview?",
            answer: "Start by reviewing the interview type and requirements. Make sure you're in a quiet environment with a stable internet connection. Test your microphone and camera before the interview starts."
        },
        {
            question: "Can I reschedule my interview?",
            answer: "Yes, you can reschedule your interview up to 24 hours before the scheduled time. Go to 'My Interviews' and click on the interview you want to reschedule."
        },
        {
            question: "How does the AI feedback work?",
            answer: "Our AI analyzes your responses, body language, and speech patterns to provide comprehensive feedback. You'll receive a detailed report after each interview with specific improvement areas."
        },
        {
            question: "What's included in the Pro plan?",
            answer: "The Pro plan includes unlimited interviews, AI-powered feedback, interview recordings, performance analytics, and priority support."
        }
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white-900">Support</h1>
                <p className="text-white-600 mt-1">Get help with your interview preparation</p>
            </div>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Live Chat */}
                {/* <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <MessageCircle className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Live Chat</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Chat with our support team in real-time</p>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Start Chat
                    </Button>
                </div> */}

                {/* Email Support */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 col-span-3">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Mail className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Email Support</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Send us an email and we'll respond within 24 hours</p>
                    <Button variant="outline" className="w-full bg-black" asChild>
                        <a href="mailto:support@eval8 ai.ai">Send Email</a>
                    </Button>
                </div>

                {/* Phone Support */}
                {/* <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Phone className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Phone Support</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Available for Pro plan users Mon-Fri, 9am-5pm</p>
                    <Button variant="outline" className="w-full" disabled>
                        Pro Feature
                    </Button>
                </div> */}
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h2>
                    </div>
                    <Button variant="ghost" className="text-indigo-600">
                        View All
                    </Button>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left text-slate-900 hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default Support; 





