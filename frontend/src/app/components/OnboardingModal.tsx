"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Compass, Car, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <Compass size={56} className="text-primary-blue" />,
      title: "Need a Ride?",
      description: "Find drivers already traveling your route. Request a seat, meet at a convenient location, and travel together safely."
    },
    {
      icon: <Car size={56} className="text-brand-success" />,
      title: "Driving somewhere?",
      description: "Publish your ride and receive passenger requests. Share your route and offset fuel expenses with trusted passengers."
    },
    {
      icon: <ShieldCheck size={56} className="text-amber-500" />,
      title: "Travel Together",
      description: "Share fuel and toll costs safely with verified users. Check driver profiles, ratings, and active statuses before booking."
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rl_onboarding_completed', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col min-h-[460px] justify-between"
        >
          {/* Header & Close */}
          <div className="flex justify-between items-center px-6 pt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Step {currentSlide + 1} of {slides.length}
            </span>
            <button
              onClick={handleComplete}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Slide Content */}
          <div className="px-8 py-4 flex-grow flex flex-col items-center justify-center text-center space-y-6">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-5"
            >
              <div className="p-5 bg-slate-50 rounded-full border border-slate-100/50 shadow-inner">
                {slides[currentSlide].icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-primary-text">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed max-w-sm">
                  {slides[currentSlide].description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Footer Navigation */}
          <div className="bg-slate-50 border-t border-brand-border px-6 py-5 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-5 bg-primary-blue' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {currentSlide > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3.5 py-2 border border-brand-border rounded-xl text-xs font-bold text-secondary-text hover:bg-white hover:text-primary-text transition-colors flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-dark-blue hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center gap-1"
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'} 
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
