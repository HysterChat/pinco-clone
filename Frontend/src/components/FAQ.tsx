import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const FAQ = () => {
    const faqs = [
        {
            question: "What is eval8 ai?",
            answer: "eval8 ai is an AI-powered mock interview platform where you can practice HR, Technical, and Versant interviews anytime with instant feedback."
        },
        {
            question: "How does the mock interview work?",
            answer: "You choose the type of interview (HR, Technical, Company-Specific, etc.), answer questions through video, and our AI gives you a score and tips for improvement."
        },
        {
            question: "Is it useful for freshers or only experienced candidates?",
            answer: "eval8 ai is built especially for both freshers and experienced candidates to build interview confidence, communication skills, and job readiness."
        },
        {
            question: "Can I use eval8 ai on my phone?",
            answer: "Yes! You can use it on your phone, tablet, or laptop—anytime, anywhere."
        },
        {
            question: "How many mock interviews can I take?",
            answer: "Unlimited! You can practice as many times as you want for a full year after subscribing."
        },
        {
            question: "Will the AI understand my accent or speech?",
            answer: "Yes, our AI is trained to understand Indian accents and various speech patterns. It even gives feedback on clarity and fluency."
        },
        {
            question: "Which companies' interview patterns are covered?",
            answer: "We cover company-specific mock interviews for TCS, Infosys, Wipro, Accenture, Cognizant, and more."
        },
        {
            question: "Can I track my improvement over time?",
            answer: "Yes! You get a personal dashboard with scores and insights that show how you're improving in confidence, communication, and technical answers."
        },
        {
            question: "Is there a certificate after completion?",
            answer: "Yes, you'll receive a completion certificate that highlights your practice and skills—a great addition to your resume or LinkedIn profile."
        },
        {
            question: "What if I face a technical issue?",
            answer: "Our support team is available to help you via email. We'll resolve your issue quickly so you can keep practicing."
        }
    ];

    return (
        <div className="bg-primary-950 py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-primary mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-primary/80">
                        Find answers to common questions about eval8 ai and our interview preparation platform.
                    </p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="bg-primary/10 rounded-lg shadow-sm border border-primary/20"
                        >
                            <AccordionTrigger className="px-6 text-primary hover:text-orange-500 hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4 text-primary/80">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-12 bg-primary/20 rounded-xl p-8 text-center">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                        Still have questions?
                    </h3>
                    <p className="text-primary/80 mb-6">
                        If you couldn't find the answer to your question, our team is here to help.
                    </p>
                    <Button
                        asChild
                        className="bg-primary hover:bg-orange-500 text-white"
                    >
                        <Link to="/contact">Contact Support →</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;






