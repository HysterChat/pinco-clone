import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Plan {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    features: string[];
}

const Pricing = () => {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<{ [key: string]: Plan }>({});
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadSubscriptionPlans();
    }, []);

    const loadSubscriptionPlans = async () => {
        try {
            const data = await API.getSubscriptionPlans();
            setPlans(data);
        } catch (error) {
            console.error('Error loading subscription plans:', error);
            toast({
                title: "Error",
                description: "Failed to load subscription plans",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePlanClick = () => {
        navigate('/login');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const premiumPlan = plans.premium;
    const freePlan = plans.free;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0
        }
    };

    return (
        <section id="pricing" className="py-12 md:py-20 bg-[#0A1B3F]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4">
                        Choose Your Plan
                    </h2>
                    <p className="text-base md:text-lg text-[#FFFFFF]/80 max-w-3xl mx-auto">
                        Select the perfect plan to enhance your interview preparation journey
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
                >
                    {/* Free Plan */}
                    <motion.div
                        variants={itemVariants}
                        className="relative bg-[#FFFFFF]/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-lg border border-[#FFFFFF]/10 transform hover:-translate-y-2 transition-all duration-300"
                    >
                        <h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">{freePlan?.name || 'Free Plan'}</h3>
                        <p className="text-[#FFFFFF]/80 mb-4">{freePlan?.description || 'Limited access with 1 free interview'}</p>
                        <div className="flex items-baseline mb-6">
                            <span className="text-2xl font-bold text-[#FFFFFF]">₹</span>
                            <span className="text-4xl md:text-5xl font-bold text-[#FFFFFF]">0</span>
                            <span className="text-[#FFFFFF]/80 ml-2">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {freePlan?.features?.map((feature, index) => (
                                <li key={index} className="flex items-start text-[#FFFFFF]/90">
                                    <Check className="h-5 w-5 text-[#2D7CFF] mr-3 flex-shrink-0 mt-1" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            onClick={handlePlanClick}
                            className="w-full py-3 md:py-6 bg-[#2D7CFF] hover:bg-[#2D7CFF]/90 text-[#FFFFFF] rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
                        >
                            Get Started
                        </Button>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        variants={itemVariants}
                        className="relative bg-[#FFFFFF]/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-lg border border-[#2D7CFF] ring-2 ring-[#2D7CFF] transform hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 -mt-4 mr-4 px-3 py-1 bg-[#2D7CFF] text-[#FFFFFF] text-sm font-semibold rounded-full shadow-md">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">{premiumPlan?.name || 'Premium Plan'}</h3>
                        <p className="text-[#FFFFFF]/80 mb-4">{premiumPlan?.description || 'Unlimited access to all features'}</p>
                        <div className="flex items-baseline mb-6">
                            <span className="text-2xl font-bold text-[#FFFFFF]">₹</span>
                            <span className="text-4xl md:text-5xl font-bold text-[#FFFFFF]">{(premiumPlan?.amount || 0) / 100}</span>
                            <span className="text-[#FFFFFF]/80 ml-2">/year</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {premiumPlan?.features?.map((feature, index) => (
                                <li key={index} className="flex items-start text-[#FFFFFF]/90">
                                    <Check className="h-5 w-5 text-[#2D7CFF] mr-3 flex-shrink-0 mt-1" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            onClick={handlePlanClick}
                            className="w-full py-3 md:py-6 bg-[#2D7CFF] hover:bg-[#2D7CFF]/90 text-[#FFFFFF] rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
                        >
                            Upgrade Now
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-center mt-10 md:mt-12"
                >
                    <p className="text-[#FFFFFF]/70 text-sm md:text-base">
                        All plans include a 14-day money-back guarantee
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Pricing; 






