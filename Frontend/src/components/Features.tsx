import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Building, UserCheck, Mic, Clock, LineChart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: "AI-Powered Mock Interviews",
      description: "Practice Technical, HR, and Behavioral interviews with real-time AI evaluation and instant scoring.",
      icon: Bot,
    },
    {
      title: "Company-Specific Interview Preparation",
      description: "Choose from TCS, Infosys, Wipro, and other top companies to simulate their unique interview patterns.",
      icon: Building,
    },
    {
      title: "Confidence & Communication Insights",
      description: "Get personalized tips to improve your body language, tone, and fluency to ace interviews with confidence.",
      icon: UserCheck,
    },
    {
      title: "24/7 Interview Practice Access",
      description: "Practice anytime, anywhere—with unlimited mock interviews available 24/7, helping you prepare at your own pace.",
      icon: Clock,
    },
    {
      title: " Versant Round Practice",
      description: "Prepare for language proficiency rounds used by companies like Accenture and Amazon, with automated voice and speech analysis.",
      icon: Mic,
    },
    {
      title: "Progress Tracker & Skill Graphs",
      description: "Visual dashboards show your improvement over time in areas like technical skills, communication, and confidence.",
      icon: LineChart,
    },
  ];

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
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features" className="py-12 md:py-20 bg-[#0A1B3F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4">
            Powerful Features for Your Success
          </h2>
          <p className="text-xl text-[#FFFFFF]/80 max-w-3xl mx-auto">
            Discover the tools and capabilities that make eval8 ai the perfect choice for modern businesses
          </p>
        </motion.div>



        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="hover:shadow-elegant transition-all duration-300 border-[#2D7CFF]/20 bg-[#FFFFFF]/5 backdrop-blur-sm group hover:-translate-y-2">
                <CardHeader>
                  <motion.div
                    className="mb-4 text-[#2D7CFF]"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {React.createElement(feature.icon, { size: 32, strokeWidth: 2 })}
                  </motion.div>
                  <CardTitle className="text-xl text-[#FFFFFF] group-hover:text-[#2D7CFF] transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-[#FFFFFF]/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;






