import React from 'react';
import { motion, Variants, Variant } from 'framer-motion';

interface Step {
  step: number;
  title: string;
  description: string;
  highlight: string;
  icon: string;
}

const howItWorksSteps: Step[] = [
  {
    step: 1,
    title: "Sign Up with Gmail",
    description: "Start instantly with a one-click Gmail login. Safe, secure, and no complicated forms.",
    highlight: "Begin in under 30 seconds.",
    icon: "🔐"
  },
  {
    step: 2,
    title: "Fill Your Profile",
    description: "Enter your Full Name, College, Branch, Roll Number, and Year of Passing to personalize your experience.",
    highlight: "Personalization starts here.",
    icon: "📋"
  },
  {
    step: 3,
    title: "Choose Your Interview Track",
    description: "Select your career path like Tech, Non-Tech, MBA, Government, or Core. Get role-specific questions tailored for you.",
    highlight: "Your interview. Your way.",
    icon: "🎯"
  },
  {
    step: 4,
    title: "Attend AI-Powered Mock Interviews",
    description: "Face realistic interviews and get real-time feedback on confidence, fluency, structure, and more.",
    highlight: "Practice like it's the real deal.",
    icon: "🎙️"
  },
  {
    step: 5,
    title: "Get Your Interview Report Card",
    description: "Detailed scoring on voice, content, clarity, and improvement areas with practical tips.",
    highlight: "Your success is measurable.",
    icon: "📊"
  },
  {
    step: 6,
    title: "Practice. Improve. Get Interview-Ready",
    description: "Repeat mocks anytime. Track your improvement and level up your interview readiness.",
    highlight: "Every round brings you closer to your job.",
    icon: "🚀"
  }
];

const HowItWorks = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: ({ isEven }: { isEven: boolean }) => ({
      opacity: 0,
      x: isEven ? 100 : -100
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.8
      }
    }
  };

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-[#0A1B3F] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-white/80">
            Your journey to interview success in six simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="relative"
        >
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#2D7CFF]/20 transform -translate-x-1/2" />

          {/* Steps Container */}
          <div className="relative space-y-12 md:space-y-24">
            {howItWorksSteps.map((step, index) => {
              const isEven = step.step % 2 === 0;
              return (
                <motion.div
                  key={step.step}
                  custom={{ isEven }}
                  variants={itemVariants}
                  viewport={{ once: false, amount: 0.3 }}
                  className={`relative flex items-center ${isEven ? 'justify-start md:justify-end' : 'justify-end md:justify-start'
                    }`}
                >
                  {/* Content Container */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#2D7CFF]/50 transition-all duration-300 transform hover:-translate-y-1">
                      {/* Step Number and Icon */}
                      <div className="flex items-center mb-4">
                        <motion.div
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2D7CFF]/10 border border-[#2D7CFF]/20"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <span className="text-2xl">{step.icon}</span>
                        </motion.div>
                        <span className="ml-4 text-[#2D7CFF] font-bold">Step {step.step}</span>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-white/80 mb-3">{step.description}</p>
                      <p className="text-[#2D7CFF] font-medium">{step.highlight}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < howItWorksSteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: false }}
                      className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
                    >
                      <svg
                        className="w-6 h-12 text-[#2D7CFF]/30"
                        fill="none"
                        viewBox="0 0 24 48"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 0v36m-6-6l6 6 6-6"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks; 






