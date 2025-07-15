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
        <section id="pricing" className="py-12 md:py-20 bg-primary-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        Choose Your Plan
                    </h2>
                    <p className="text-base md:text-lg text-primary/80 max-w-3xl mx-auto">
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
                        className="relative bg-primary/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-lg border border-primary/20 transform hover:-translate-y-2 transition-all duration-300"
                    >
                        <h3 className="text-2xl font-bold text-primary mb-2">{freePlan?.name || 'Free Plan'}</h3>
                        <p className="text-primary/80 mb-4">{freePlan?.description || 'Limited access with 1 free interview'}</p>
                        <div className="flex items-baseline mb-6">
                            <span className="text-2xl font-bold text-primary">₹</span>
                            <span className="text-4xl md:text-5xl font-bold text-primary">0</span>
                            <span className="text-primary/80 ml-2">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {freePlan?.features?.map((feature, index) => (
                                <li key={index} className="flex items-start text-primary/90">
                                    <Check className="h-5 w-5 text-black mr-3 flex-shrink-0 mt-1" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            onClick={handlePlanClick}
                            className="w-full py-3 md:py-6 bg-primary hover:bg-black text-white rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
                        >
                            Get Started
                        </Button>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        variants={itemVariants}
                        className="relative bg-primary/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-lg border border-black ring-2 ring-black transform hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 -mt-4 mr-4 px-3 py-1 bg-black text-white text-sm font-semibold rounded-full shadow-md">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-2">{premiumPlan?.name || 'Premium Plan'}</h3>
                        <p className="text-primary/80 mb-4">{premiumPlan?.description || 'Unlimited access to all features'}</p>
                        <div className="flex items-baseline mb-6">
                            <span className="text-2xl font-bold text-primary">₹</span>
                            <span className="text-4xl md:text-5xl font-bold text-primary">{(premiumPlan?.amount || 0) / 100}</span>
                            <span className="text-primary/80 ml-2">/year</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {premiumPlan?.features?.map((feature, index) => (
                                <li key={index} className="flex items-start text-primary/90">
                                    <Check className="h-5 w-5 text-black mr-3 flex-shrink-0 mt-1" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            onClick={handlePlanClick}
                            className="w-full py-3 md:py-6 bg-black hover:bg-primary text-white rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
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
                    <p className="text-primary/70 text-sm md:text-base">
                        All plans include a 14-day money-back guarantee
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Pricing;






