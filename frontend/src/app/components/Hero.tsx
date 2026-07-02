"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Search, PlusCircle, ArrowRight } from 'lucide-react';

interface HeroProps {
  onFindRideClick: () => void;
  onOfferRideClick: () => void;
  onRequestRideClick: () => void;
}

export default function Hero({ onFindRideClick, onOfferRideClick, onRequestRideClick }: HeroProps) {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col items-center justify-center text-center space-y-12">
        
        {/* Tagline / Intro */}
        <div className="space-y-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-primary-blue"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-pulse"></span>
            Commute Safely & Split Fuel Costs
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-primary-text leading-[1.15]"
          >
            Connect. Travel.<br />
            <span className="bg-gradient-to-r from-primary-blue to-dark-blue bg-clip-text text-transparent">
              Split the Cost.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-secondary-text max-w-xl mx-auto leading-relaxed"
          >
            Welcome to RideLink. Whether you are driving your car or looking for a ride, get to your destination together easily, affordably, and safely.
          </motion.p>
        </div>

        {/* The Two Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-2">
          
          {/* Card 1: Driving (Offer Ride) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-brand-border rounded-[32px] p-8 shadow-md hover:shadow-xl hover:border-primary-blue/30 transition-all text-left flex flex-col justify-between space-y-8 relative overflow-hidden group"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-blue/5 rounded-full blur-2xl group-hover:bg-primary-blue/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary-blue shadow-sm border border-blue-100/50">
                <Car size={30} className="stroke-[2]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-primary-text flex items-center gap-2">
                  🚗 I'm Driving
                </h2>
                <h3 className="text-lg font-bold text-slate-800">
                  Offer Your Ride
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Traveling from one city to another? Publish your trip and let passengers traveling on your route request a seat.
                </p>
              </div>
            </div>

            <button
              onClick={onOfferRideClick}
              className="w-full py-4 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-sm rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:bg-primary-blue"
            >
              Offer Ride
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </motion.div>

          {/* Card 2: Need a Ride (Find Ride) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-brand-border rounded-[32px] p-8 shadow-md hover:shadow-xl hover:border-primary-blue/30 transition-all text-left flex flex-col justify-between space-y-8 relative overflow-hidden group"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-brand-success shadow-sm border border-emerald-100/50">
                <Search size={28} className="stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-primary-text flex items-center gap-2">
                  🙋 I Need a Ride
                </h2>
                <h3 className="text-lg font-bold text-slate-800">
                  Find a Ride
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Search for drivers already traveling your route and request a seat in seconds. Filter by date, route, or price.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={onFindRideClick}
                className="flex-1 py-4 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-sm rounded-2xl hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center gap-2"
              >
                Find Ride
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onRequestRideClick}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                Request a Ride
                <PlusCircle size={16} className="text-slate-500" />
              </button>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
