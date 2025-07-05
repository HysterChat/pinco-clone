import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO at TechCorp",
      content: "Pinco has revolutionized how we manage our business operations. The efficiency gains are incredible!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Michael Chen",
      role: "Product Manager at StartupXYZ",
      content: "The best platform we've used. Simple, powerful, and exactly what our team needed to scale.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Emily Rodriguez",
      role: "Founder at InnovateNow",
      content: "Outstanding support and features. Pinco helped us achieve our goals faster than we imagined.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="testimonials" className="py-12 md:py-20 bg-[#0A1B3F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-base md:text-lg text-[#FFFFFF]/80 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Pinco for their success
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-[#FFFFFF]/5 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#FFFFFF]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-[#2D7CFF] shadow-sm"
                    />
                    <div>
                      <h4 className="font-semibold text-[#FFFFFF] text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-[#FFFFFF]/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-[#FFFFFF]/90 italic leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
