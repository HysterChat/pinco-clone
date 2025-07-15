import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import API from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Define window.Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface SubscriptionStatus {
    is_premium: boolean;
    subscription_status: string;
    subscription_end_date: string | null;
    completed_interviews: number;
    can_take_interview: boolean;
    can_access_versant: boolean;
    remaining_free_interviews: number | null;
}

interface Plan {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    features: string[];
}

const Subscription = () => {
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [plans, setPlans] = useState<{ [key: string]: Plan }>({});
    const { toast } = useToast();
    const [coupon, setCoupon] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    useEffect(() => {
        loadSubscriptionStatus();
        loadSubscriptionPlans();
        loadRazorpayScript();
    }, []);

    const loadSubscriptionStatus = async () => {
        try {
            const data = await API.getSubscriptionStatus();
            setStatus(data);
        } catch (error) {
            console.error('Error loading subscription status:', error);
            toast({
                title: "Error",
                description: "Failed to load subscription status",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

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
        }
    };

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    const handlePayment = async () => {
        try {
            setProcessing(true);
            const order = await API.createPaymentOrder(coupon.trim() || undefined);
            
            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "Interview Bot",
                description: "Premium Subscription",
                order_id: order.order_id,
                handler: async function (response: any) {
                    try {
                        const result = await API.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (result.status === "success") {
                            toast({
                                title: "Success",
                                description: "Payment successful! Your subscription is now active.",
                            });
                            // Refresh the page to update subscription status
                            window.location.reload();
                        } else {
                            toast({
                                title: "Error",
                                description: result.message || "Payment verification failed. Please contact support.",
                                variant: "destructive"
                            });
                        }
                    } catch (error: any) {
                        console.error('Payment verification failed:', error);
                        toast({
                            title: "Error",
                            description: error.response?.data?.detail || "Payment verification failed. Please contact support.",
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    name: "User",
                    email: "user@example.com"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Error initiating payment:', error);
            toast({
                title: "Error",
                description: "Failed to initiate payment",
                variant: "destructive"
            });
        } finally {
            setProcessing(false);
        }
    };

    const applyCoupon = async () => {
        if (!coupon.trim()) return;
        try {
            const data = await API.getCoupon(coupon.trim());
            if (!data.active) {
                setCouponError('Coupon is inactive');
                setDiscountedPrice(null);
                return;
            }
            const now = Date.now();
            if ((data.valid_from && new Date(data.valid_from).getTime() > now) || (data.valid_to && new Date(data.valid_to).getTime() < now)) {
                setCouponError('Coupon not valid today');
                setDiscountedPrice(null);
                return;
            }
            setCouponError(null);
            // calculate discounted rupees
            let pricePaise = premiumPlan?.amount || 0;
            if (data.discount_percent) {
                pricePaise = Math.round(pricePaise * (1 - data.discount_percent / 100));
            } else if (data.discount_amount) {
                pricePaise = Math.max(0, pricePaise - data.discount_amount);
            }
            setDiscountedPrice(pricePaise / 100);
        } catch (err) {
            setCouponError('Invalid coupon');
            setDiscountedPrice(null);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const premiumPlan = plans.premium;
    const freePlan = plans.free;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <Card className={`relative ${!status?.is_premium ? 'border-blue-500' : ''}`}>
                    {!status?.is_premium && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl">
                            Current Plan
                        </div>
                    )}
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-2">{freePlan?.name || 'Free Plan'}</h2>
                        <p className="text-gray-600 mb-4">{freePlan?.description || 'Limited access with 1 free interview'}</p>
                        <p className="text-2xl font-bold mb-4">₹0/month</p>
                        <ul className="mb-6 space-y-2">
                            {freePlan?.features?.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="mr-2">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button 
                            className="w-full" 
                            variant="outline"
                            disabled={true}
                        >
                            Free Plan
                        </Button>
                    </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className={`relative ${status?.is_premium ? 'border-blue-500' : ''}`}>
                    {status?.is_premium && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl">
                            Current Plan
                        </div>
                    )}
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-2">{premiumPlan?.name || 'Premium Plan'}</h2>
                        <p className="text-gray-600 mb-4">{premiumPlan?.description || 'Unlimited access to all features'}</p>
                        <p className="text-2xl font-bold mb-4">₹{(premiumPlan?.amount || 0) / 100}/year</p>
                        <ul className="mb-6 space-y-2">
                            {premiumPlan?.features?.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="mr-2">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {discountedPrice !== null ? (
                            <p className="text-xl font-bold text-green-600 mb-4">Discounted Price: ₹{discountedPrice}</p>
                        ) : null}

                        {couponError ? <p className="text-sm text-red-500 mb-2">{couponError}</p> : null}
                        <div className="flex gap-2 mb-4">
                            <input type="text" placeholder="Coupon code" value={coupon} onChange={(e)=>setCoupon(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" />
                            <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                        </div>
                        <Button 
                            className="w-full" 
                            onClick={handlePayment}
                            disabled={status?.is_premium || processing}
                        >
                            {processing ? 'Processing...' : status?.is_premium ? 'Current Plan' : 'Upgrade Now'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {status?.is_premium && status.subscription_end_date && (
                <p className="mt-4 text-center text-gray-600">
                    Your premium subscription is valid until {new Date(status.subscription_end_date).toLocaleDateString()}
                </p>
            )}
        </div>
    );
};

export default Subscription; 





