"use client";

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RideCard from './components/RideCard';
import Footer from './components/Footer';
import DashboardView from './components/DashboardView';
import OnboardingModal from './components/OnboardingModal';
import BookingRequestModal from './components/BookingRequestModal';
import { api } from './utils/api';
import { useApp } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle, ChevronDown, Star, Users, X, ArrowUpRight,
  Car, Info, ShieldCheck, Camera, Lock, RefreshCw, PlusCircle, Award
} from 'lucide-react';

export default function Home() {
  const { user, triggerMockNotification, verifyDriver } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [rides, setRides] = useState<any[]>([]);
  
  // Search state
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  
  // Publish ride form state
  const [publishFrom, setPublishFrom] = useState('');
  const [publishTo, setPublishTo] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('08:00');
  const [publishSeats, setPublishSeats] = useState('3');
  const [publishPrice, setPublishPrice] = useState('500');
  const [publishVehicle, setPublishVehicle] = useState('');
  
  // Driver Verification Form state
  const [verificationStep, setVerificationStep] = useState(1);
  const [driverSelfie, setDriverSelfie] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverVehicleReg, setDriverVehicleReg] = useState('KL-07-CD-1234');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Booking flow states
  const [bookingStatusMap, setBookingStatusMap] = useState<Record<string, 'pending' | 'accepted' | 'rejected' | 'none'>>({});
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<any | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  
  // Onboarding & Tracking URL Check states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [trackBookingId, setTrackBookingId] = useState<string | null>(null);

  // Live Tracking state variables
  const [trackProgress, setTrackProgress] = useState(0.0);
  const [trackStatusIdx, setTrackStatusIdx] = useState(0);
  const trackStatuses = ["Waiting for Pickup", "Passenger Picked Up", "On the Way", "Near Destination", "Trip Completed"];

  // Passenger Ride Request states
  const [isRequestRideOpen, setIsRequestRideOpen] = useState(false);
  const [requestFrom, setRequestFrom] = useState('');
  const [requestTo, setRequestTo] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestTime, setRequestTime] = useState('08:00');
  const [requestFlexible, setRequestFlexible] = useState('±1 hour');
  const [requestSeats, setRequestSeats] = useState(1);
  const [requestPrice, setRequestPrice] = useState(300);
  const [requestNote, setRequestNote] = useState('');
  const [requestSubmitLoading, setRequestSubmitLoading] = useState(false);

  // Smart route matching states
  const [showMatchingBanner, setShowMatchingBanner] = useState(false);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [newlyCreatedRide, setNewlyCreatedRide] = useState<any | null>(null);

  // Load rides & check tracking URL parameters
  const fetchRides = async (filters: any = {}) => {
    try {
      const res = await api.searchRides(filters);
      if (res.success) {
        setRides(res.rides);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRides();
    
    // Check if tracking parameter is present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const trackParam = urlParams.get('track');
      if (trackParam) {
        setTrackBookingId(trackParam);
      }

      // Check onboarding completed
      const onboarded = localStorage.getItem('rl_onboarding_completed');
      if (!onboarded && !trackParam) {
        setIsOnboardingOpen(true);
      }
    }
  }, []);

  // Passenger Notification for matching rides
  useEffect(() => {
    if (user && !user.isDriver) {
      const checkMatchingRides = async () => {
        try {
          const reqRes = await api.getPassengerRequests({ passengerId: user.id });
          if (reqRes.success && reqRes.requests) {
            const activeRequests = reqRes.requests.filter((r: any) => r.status === 'searching');
            const ridesRes = await api.searchRides({});
            if (ridesRes.success && ridesRes.rides) {
              activeRequests.forEach((reqObj: any) => {
                const match = ridesRes.rides.find((r: any) => 
                  r.origin.toLowerCase() === reqObj.origin.toLowerCase() &&
                  r.destination.toLowerCase() === reqObj.destination.toLowerCase() &&
                  r.date === reqObj.date &&
                  r.status === 'active'
                );
                if (match) {
                  const alertKey = `alert_ride_match_${reqObj.id}_${match.id}`;
                  if (!localStorage.getItem(alertKey)) {
                    triggerMockNotification(`Great news! A driver is traveling from ${reqObj.origin} to ${reqObj.destination} on your selected date. Review the ride and send your request.`);
                    localStorage.setItem(alertKey, 'alerted');
                  }
                }
              });
            }
          }
        } catch (e) {
          console.warn("Matching rides check failed", e);
        }
      };
      checkMatchingRides();
    }
  }, [user, rides]);

  // Automatic Public Tracking Live Simulation
  useEffect(() => {
    if (trackBookingId) {
      const interval = setInterval(() => {
        setTrackStatusIdx((prev) => {
          if (prev < 4) {
            setTrackProgress((p) => Math.min(1.0, p + 0.25));
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [trackBookingId]);

  const handleHeroFindRide = () => {
    setActiveTab('find-ride');
    fetchRides();
  };

  const handleHeroOfferRide = () => {
    if (!user) {
      triggerMockNotification("Please login using the button at the top right to offer a ride!");
    } else {
      setActiveTab('offer-ride');
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides({
      from: searchFrom,
      to: searchTo,
      date: searchDate,
    });
  };

  const handleBookingSubmission = async (seats: number, pickup: string, message: string) => {
    if (!user) {
      triggerMockNotification("Please login to request a ride!");
      return { success: false };
    }

    try {
      const res = await api.createBooking({ 
        rideId: selectedRideForBooking.id, 
        seatsBooked: seats 
      });
      if (res.success) {
        setBookingStatusMap(prev => ({ ...prev, [selectedRideForBooking.id]: 'pending' }));
        triggerMockNotification("Booking request sent! Waiting for driver's approval.");
        return res;
      }
      return { success: false };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  const handlePublishRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerMockNotification("Please login as a Driver to offer a ride!");
      return;
    }

    try {
      const res = await api.createRide({
        origin: publishFrom,
        destination: publishTo,
        date: publishDate,
        time: publishTime,
        seatsAvailable: parseInt(publishSeats),
        contributionAmount: parseInt(publishPrice),
        vehicle: publishVehicle || undefined,
        womenOnly: false
      });

      if (res.success) {
        // Fetch matching passenger requests on the same route and date
        const matchRes = await api.getPassengerRequests({
          from: publishFrom,
          to: publishTo
        });
        
        let matching: any[] = [];
        if (matchRes.success && matchRes.requests) {
          matching = matchRes.requests.filter((r: any) => 
            r.date === publishDate && 
            r.status === 'searching'
          );
        }

        // Reset form
        setPublishFrom('');
        setPublishTo('');
        setPublishDate('');
        setPublishTime('08:00');
        setPublishSeats('3');
        setPublishPrice('500');
        setPublishVehicle('');

        // Fetch updated rides list
        fetchRides();

        if (matching.length > 0) {
          setMatchingRequests(matching);
          setNewlyCreatedRide(res.ride);
          setShowMatchingBanner(true);
          triggerMockNotification(`Ride published successfully! Found ${matching.length} passenger requests on this route.`);
        } else {
          triggerMockNotification("Ride published successfully! Switched to Driver Dashboard.");
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendOfferToPassenger = async (requestId: string, rideId: string) => {
    try {
      const res = await api.updatePassengerRequest(requestId, {
        action: 'send_offer',
        offeredRideId: rideId
      });
      if (res.success) {
        triggerMockNotification("Offer successfully sent to passenger!");
        setMatchingRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerMockNotification("Please login to request a ride!");
      return;
    }
    setRequestSubmitLoading(true);
    try {
      const res = await api.createPassengerRequest({
        origin: requestFrom,
        destination: requestTo,
        date: requestDate,
        time: requestTime,
        flexibleTime: requestFlexible,
        seatsNeeded: requestSeats,
        maxPrice: requestPrice,
        note: requestNote
      });

      if (res.success) {
        triggerMockNotification("Ride request posted successfully!");
        setIsRequestRideOpen(false);
        // Clear fields
        setRequestFrom('');
        setRequestTo('');
        setRequestDate('');
        setRequestTime('08:00');
        setRequestFlexible('±1 hour');
        setRequestSeats(1);
        setRequestPrice(300);
        setRequestNote('');
        
        // Switch to dashboard tab to see status
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestSubmitLoading(false);
    }
  };

  const handleDriverVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStep < 4) {
      setVerificationStep(verificationStep + 1);
      return;
    }

    setVerificationLoading(true);
    setTimeout(async () => {
      const success = await verifyDriver(
        driverLicense || "DL-9876543210",
        driverVehicleReg || "KL-07-CD-1234",
        driverSelfie || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"
      );
      setVerificationLoading(false);
      if (success) {
        setVerificationStep(1);
        triggerMockNotification("Driver verification approved! You can now share rides.");
      }
    }, 1500);
  };

  // Popular route shortcuts
  const handlePopularRouteClick = (from: string, to: string) => {
    setSearchFrom(from);
    setSearchTo(to);
    fetchRides({ from, to });
    setActiveTab('find-ride');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // PUBLIC TRACKING VIEW RENDER IF URL HAS ?track=booking_id
  // ============================================================================
  if (trackBookingId) {
    const progressPercent = trackProgress * 100;
    const distanceRemaining = Math.max(0, Math.round(280 - (280 * trackProgress)));
    const etaString = trackProgress === 1.0 ? "Arrived" : "12:30 PM";

    return (
      <div className="gradient-bg min-h-screen flex flex-col justify-between">
        {/* Simple Minimal Topbar */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-brand-border py-4 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-blue text-white rounded-lg shadow-sm">
                <Car size={16} />
              </div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-primary-blue to-dark-blue bg-clip-text text-transparent">
                RideLink Live Map
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase border">
              <Lock size={10} className="text-slate-400" /> Secure tracking link
            </div>
          </div>
        </header>

        {/* Public Tracking Content */}
        <main className="flex-grow pt-24 pb-16 max-w-4xl mx-auto px-4 w-full space-y-6">
          
          {/* Tracking Header Alert */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl text-xs text-primary-blue flex gap-3 shadow-sm">
            <Info size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Public Location sharing active</p>
              <p className="text-secondary-text mt-0.5">This live tracker expires automatically once the trip is completed. Safe arrival status is monitored continuously.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Live GPS Simulated Map */}
            <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-[32px] p-5 text-white shadow-xl space-y-5 overflow-hidden relative min-h-[350px] flex flex-col justify-between">
              
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-blue/15 rounded-full blur-[80px]" />

              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Live GPS Position
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Mapbox Tracking v4</span>
              </div>

              {/* Simulated Map Routing SVG */}
              <div className="relative h-44 w-full z-10">
                <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 300 150" fill="none">
                  {/* Base Route Path */}
                  <path
                    d="M30,75 C90,40 180,120 270,75"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Completed Route Path */}
                  <path
                    d="M30,75 C90,40 180,120 270,75"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="400"
                    strokeDashoffset={400 - (400 * trackProgress)}
                    className="transition-all duration-1000"
                  />

                  {/* Marker Nodes */}
                  <circle cx="30" cy="75" r="5" fill="#3B82F6" />
                  <circle cx="270" cy="75" r="5" fill="#10B981" />

                  {/* Moving Car Dot */}
                  {/* Simple Bezier coordinate approximation for demo rendering */}
                  <g style={{ 
                    transform: `translate(${30 + (240 * trackProgress)}px, ${75 + (Math.sin(trackProgress * Math.PI * 2) * 20)}px)`,
                    transition: 'transform 1s ease-in-out' 
                  }}>
                    <circle cx="0" cy="0" r="8" fill="#F59E0B" className="animate-pulse" />
                    <circle cx="0" cy="0" r="14" stroke="#F59E0B" strokeWidth="2" opacity="0.3" className="animate-ping" />
                  </g>
                </svg>

                {/* Cities text */}
                <div className="absolute left-2 top-[90px] text-[10px] font-bold text-slate-400">Kochi (Start)</div>
                <div className="absolute right-2 top-[90px] text-[10px] font-bold text-emerald-400 text-right">Kannur (End)</div>
              </div>

              {/* Status Update Details */}
              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center z-10">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-500">Trip Progression</p>
                  <p className="text-sm font-extrabold text-white transition-all">{trackStatuses[trackStatusIdx]}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Distance remaining</p>
                  <p className="text-sm font-extrabold text-primary-blue">{distanceRemaining} km left</p>
                </div>
              </div>

            </div>

            {/* Right Column: Trip details, Driver card */}
            <div className="md:col-span-5 space-y-6">
              
              {/* ETA / Summary Card */}
              <div className="bg-white border border-brand-border rounded-[32px] p-6 shadow-md space-y-4">
                <h3 className="text-sm font-extrabold text-primary-text border-b pb-2.5">Trip Summary</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Estimated Arrival (ETA):</span>
                    <span className="font-extrabold text-primary-text">{etaString}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Total Distance:</span>
                    <span className="font-bold text-slate-800">280 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Trip Status:</span>
                    <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${trackStatusIdx === 4 ? 'bg-emerald-50 text-brand-success' : 'bg-blue-50 text-primary-blue'}`}>
                      {trackStatuses[trackStatusIdx]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Driver Card */}
              <div className="bg-white border border-brand-border rounded-[32px] p-6 shadow-md space-y-4">
                <h3 className="text-sm font-extrabold text-primary-text border-b pb-2.5">Driver & Vehicle details</h3>
                
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"
                    alt="Alex Johnson"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-bold text-primary-text">Alex Johnson</h4>
                      <ShieldCheck size={14} className="fill-blue-500 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Star size={11} className="fill-amber-400 stroke-amber-400" />
                      <strong className="text-slate-600 font-bold">4.9</strong>
                      <span>• Verified Driver Badge</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border p-3.5 rounded-2xl space-y-2 text-xs text-secondary-text">
                  <div className="flex justify-between">
                    <span>Vehicle Model:</span>
                    <span className="font-bold text-slate-800">Tesla Model 3 (Midnight Blue)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Plate:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1 py-0.5 rounded text-[10px]">KL-07-CD-1234</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col justify-between">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-grow pt-16">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-24 pb-24"
            >
              <Hero 
                onFindRideClick={handleHeroFindRide}
                onOfferRideClick={handleHeroOfferRide} 
                onRequestRideClick={() => {
                  if (!user) {
                    triggerMockNotification("Please login using the button at the top right to request a ride!");
                  } else {
                    setIsRequestRideOpen(true);
                  }
                }}
              />

              {/* HOW IT WORKS SECTION (Split into Driver / Passenger Journey Columns) */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
                  <h2 className="text-3xl font-extrabold text-primary-text">How It Works</h2>
                  <p className="text-sm text-secondary-text">RideLink connects people driving to the same location, making intercity travel simple and collaborative.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Column 1: Driver Journey */}
                  <div className="bg-slate-50/50 border border-brand-border rounded-[36px] p-6 sm:p-8 space-y-8">
                    <div className="flex items-center gap-3 border-b border-brand-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary-blue shadow-sm">
                        <Car size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-primary-text">Driver Journey</h3>
                        <p className="text-xs text-secondary-text">Earn back fuel costs by sharing your car seats</p>
                      </div>
                    </div>

                    <div className="space-y-6 relative pl-6 border-l border-slate-200">
                      
                      {/* Step 1 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary-blue ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 1: Publish Your Trip</h4>
                        <p className="text-xs text-secondary-text mt-1">List your route details, set dates, and seat availability.</p>
                        
                        {/* Interactive Visual Form Mockup */}
                        <div className="bg-white border border-brand-border p-4 rounded-2xl shadow-sm mt-3 space-y-2.5 max-w-xs text-[11px]">
                          <div className="grid grid-cols-2 gap-2 text-slate-600 font-semibold">
                            <div>From: <span className="text-primary-text font-bold">Kochi</span></div>
                            <div>To: <span className="text-primary-text font-bold">Calicut</span></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 text-[10px]">
                            <div>Date: 30 May</div>
                            <div>Time: 8:00 AM</div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-600 border-t border-slate-100 pt-2">
                            <span>Seats Available: 3</span>
                            <span className="font-extrabold text-primary-blue">₹500</span>
                          </div>
                          <button type="button" disabled className="w-full py-1.5 bg-primary-blue text-white rounded-lg font-bold text-[10px]">
                            Share My Ride
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary-blue ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 2: Passengers Find Your Ride</h4>
                        <p className="text-xs text-secondary-text mt-1">Interested passengers traveling the same direction view your trip details.</p>
                        
                        {/* Dynamic Notifications Mockup */}
                        <div className="space-y-1.5 mt-3 max-w-xs">
                          <div className="bg-blue-50 border border-blue-100/50 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-primary-blue font-bold shadow-sm animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-primary-blue" />
                            Rahul requested 1 seat.
                          </div>
                          <div className="bg-blue-50 border border-blue-100/50 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-primary-blue font-bold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary-blue" />
                            Aisha requested 2 seats.
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary-blue ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 3: Accept Requests</h4>
                        <p className="text-xs text-secondary-text mt-1">Review passenger ratings and travel details to accept requests.</p>
                        
                        {/* Accept Decline Mockup */}
                        <div className="bg-white border border-brand-border p-3.5 rounded-2xl shadow-sm mt-3 space-y-2.5 max-w-xs text-[10px]">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-primary-text">Rahul Prasad</p>
                              <p className="text-[9px] text-secondary-text">Rating: 4.8 ★ • Requested: 1 seat</p>
                            </div>
                            <span className="text-[9px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">"Hey, traveling home!"</span>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" disabled className="flex-1 py-1 bg-brand-success text-white font-bold rounded-lg text-[9px]">Accept</button>
                            <button type="button" disabled className="flex-1 py-1 bg-slate-100 border text-slate-700 font-bold rounded-lg text-[9px]">Decline</button>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary-blue ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 4: Start Journey</h4>
                        <p className="text-xs text-secondary-text mt-1">Passengers receive confirmation. Meet at the designated pickup and travel together.</p>
                      </div>

                    </div>
                  </div>

                  {/* Column 2: Passenger Journey */}
                  <div className="bg-slate-50/50 border border-brand-border rounded-[36px] p-6 sm:p-8 space-y-8">
                    <div className="flex items-center gap-3 border-b border-brand-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-brand-success shadow-sm">
                        <Users size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-primary-text">Passenger Journey</h3>
                        <p className="text-xs text-secondary-text">Book verified intercity rides at low fuel shares</p>
                      </div>
                    </div>

                    <div className="space-y-6 relative pl-6 border-l border-slate-200">
                      
                      {/* Step 1 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-success ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 1: Search Your Route</h4>
                        <p className="text-xs text-secondary-text mt-1">Enter your route and travel dates to find drivers matching your schedule.</p>
                        
                        {/* Search Input Mockup */}
                        <div className="bg-white border border-brand-border p-3.5 rounded-2xl shadow-sm mt-3 space-y-2.5 max-w-xs text-[10px]">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-1.5 rounded-lg border text-slate-700 font-semibold">From: Kochi</div>
                            <div className="bg-slate-50 p-1.5 rounded-lg border text-slate-700 font-semibold">To: Calicut</div>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-lg border text-slate-700 font-semibold">Date: 30 May</div>
                          <button type="button" disabled className="w-full py-1.5 bg-brand-success text-white font-bold rounded-lg text-[10px]">
                            Search
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-success ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 2: See Matching Drivers</h4>
                        <p className="text-xs text-secondary-text mt-1">Compare driver ratings, profiles, departure times, and contribution rates.</p>
                        
                        {/* Driver Card Match Mockup */}
                        <div className="bg-white border border-brand-border p-3.5 rounded-2xl shadow-sm mt-3 space-y-2.5 max-w-xs text-[10px]">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-primary-text">Arjun Nair • 4.9★</p>
                              <p className="text-[9px] text-secondary-text">Kochi ➔ Calicut • 8:00 AM</p>
                            </div>
                            <span className="font-extrabold text-brand-success">₹500</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-500 pt-2 border-t border-slate-100">
                            <span>3 seats left</span>
                            <button type="button" disabled className="bg-primary-blue text-white px-3 py-1 rounded font-bold">Request Ride</button>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-success ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 3: Send Request</h4>
                        <p className="text-xs text-secondary-text mt-1">Send a booking request and write an optional message to introduce yourself.</p>
                      </div>

                      {/* Step 4 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-success ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 4: Driver Accepts</h4>
                        <p className="text-xs text-secondary-text mt-1">Receive driver's approval. Confirm pickup point and access chat & phone details.</p>
                        
                        {/* Driver Accepts Mockup */}
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl shadow-sm mt-3 space-y-1.5 max-w-xs text-[9px]">
                          <p className="font-extrabold text-brand-success flex items-center gap-1">
                            <CheckCircle size={12} /> Ride Confirmed
                          </p>
                          <div className="text-slate-600 space-y-0.5 font-medium">
                            <p>Pickup: Near Kochi Mall entrance</p>
                            <p>Phone: +91 98765 43210</p>
                          </div>
                          <div className="flex gap-1.5 pt-1.5">
                            <span className="bg-white border px-2 py-0.5 rounded text-slate-500 font-bold">Live Chat</span>
                          </div>
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-success ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-primary-text">Step 5: Travel Together</h4>
                        <p className="text-xs text-secondary-text mt-1">Track driver location in real-time, complete the journey, and rate each other.</p>
                      </div>

                    </div>
                  </div>

                </div>
              </section>

              {/* POPULAR ROUTES SECTION */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-55">
                <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
                  <h2 className="text-3xl font-extrabold text-primary-text">Popular Routes</h2>
                  <p className="text-sm text-secondary-text">Commute to popular cities instantly with trusted community carpooling.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Route 1 */}
                  <div 
                    onClick={() => handlePopularRouteClick('Kochi', 'Kannur')}
                    className="group bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary-blue/30 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-primary-text group-hover:text-primary-blue transition-colors">Kochi → Kannur</p>
                      <p className="text-[10px] text-secondary-text uppercase tracking-wider font-semibold mt-1">Starting from ₹450</p>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-400 group-hover:text-primary-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  {/* Route 2 */}
                  <div 
                    onClick={() => handlePopularRouteClick('Kochi', 'Trivandrum')}
                    className="group bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary-blue/30 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-primary-text group-hover:text-primary-blue transition-colors">Kochi → Trivandrum</p>
                      <p className="text-[10px] text-secondary-text uppercase tracking-wider font-semibold mt-1">Starting from ₹380</p>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-400 group-hover:text-primary-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  {/* Route 3 */}
                  <div 
                    onClick={() => handlePopularRouteClick('Bangalore', 'Chennai')}
                    className="group bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary-blue/30 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-primary-text group-hover:text-primary-blue transition-colors">Bangalore → Chennai</p>
                      <p className="text-[10px] text-secondary-text uppercase tracking-wider font-semibold mt-1">Starting from ₹600</p>
                    </div>
                    <ArrowUpRight size={18} className="text-slate-400 group-hover:text-primary-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              </section>

              {/* SAFETY FIRST */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900 rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800">
                  <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-blue/20 rounded-full blur-[80px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-success/10 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-primary-blue">
                        <Shield size={14} /> Trust & Safety Verified
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your safety is our top priority</h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        At RideLink, we verify every member profile. Drivers undergo identity checks, driver license validation, and vehicle inspection before they can offer seats. Passengers can travel worry-free with live GPS sharing, and an in-app emergency SOS button.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-brand-success" />
                          <span>Government ID Badges</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-brand-success" />
                          <span>2-Way Profile Ratings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-brand-success" />
                          <span>Women-only Ride Option</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-brand-success" />
                          <span>Live Location Sharing</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-2xl max-w-xs w-full text-center space-y-4">
                        <Award size={48} className="text-amber-400 mx-auto" />
                        <h4 className="font-bold text-sm">RideLink Safety Seal</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Verified Driver verification badge is rewarded to drivers maintaining an account rating over 4.8★ and 100% clean safety checks.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* STATISTICS SECTION */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-brand-border rounded-[40px] p-8 shadow-sm">
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-extrabold text-primary-blue">15K+</p>
                    <p className="text-[10px] uppercase font-bold text-secondary-text">Successful Trips</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-extrabold text-primary-blue">99.8%</p>
                    <p className="text-[10px] uppercase font-bold text-secondary-text">Verified Members</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-extrabold text-primary-blue">240T</p>
                    <p className="text-[10px] uppercase font-bold text-secondary-text">CO2 Emissions Saved</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-extrabold text-primary-blue">₹1.4M</p>
                    <p className="text-[10px] uppercase font-bold text-secondary-text">Fuel Expenses Split</p>
                  </div>
                </div>
              </section>

              {/* TESTIMONIALS */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
                  <h2 className="text-3xl font-extrabold text-primary-text">What our community says</h2>
                  <p className="text-sm text-secondary-text">Join thousands of happy travelers splitting costs daily.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Testimonial 1 */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 stroke-amber-400" />)}
                    </div>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      "I commute from Kochi to Kannur twice a month. Train tickets are impossible to book last minute, but on RideLink, I always find a comfortable ride with verified drivers. Absolute lifesaver!"
                    </p>
                    <div className="flex items-center gap-2.5 pt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">J</div>
                      <div>
                        <p className="text-xs font-bold text-primary-text">Jaison Mathew</p>
                        <p className="text-[10px] text-secondary-text">Software Engineer</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 stroke-amber-400" />)}
                    </div>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      "Offering seats on my drive to Chennai helps me cover almost all toll and fuel costs. The passengers are verified, polite, and great conversation partners!"
                    </p>
                    <div className="flex items-center gap-2.5 pt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">M</div>
                      <div>
                        <p className="text-xs font-bold text-primary-text">Michael Chen</p>
                        <p className="text-[10px] text-secondary-text">Tesla Driver</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 stroke-amber-400" />)}
                    </div>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      "The women-only ride feature gives me complete peace of mind when traveling between Kochi and Trivandrum. RideLink has set a gold standard for safety."
                    </p>
                    <div className="flex items-center gap-2.5 pt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">S</div>
                      <div>
                        <p className="text-xs font-bold text-primary-text">Sarah Miller</p>
                        <p className="text-[10px] text-secondary-text">Graphic Designer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ SECTION */}
              <section className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-extrabold text-primary-text">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: "Is RideLink safe to use?",
                      a: "Yes, safety is our primary focus. We require identity checks, cell validation, and profile verification for all members. Our rating system ensures reviews are strictly 2-way."
                    },
                    {
                      q: "How are fuel costs calculated?",
                      a: "Driver details are reviewed and cost suggestions are automatically generated based on average fuel consumption, tolls, and distance. Contribution amounts are capped to avoid taxi pricing."
                    },
                    {
                      q: "Can I offer rides if I am not a commercial driver?",
                      a: "Absolutely. RideLink is built exactly for private car owners commuting to work or traveling intercity. It is a cost-sharing model, not a commercial taxi service."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                        className="w-full px-6 py-4 text-left font-bold text-sm text-primary-text flex items-center justify-between"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`transform transition-transform ${faqOpen === index ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {faqOpen === index && (
                        <div className="px-6 pb-4 text-xs text-secondary-text leading-relaxed border-t border-brand-border pt-3 bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

            </motion.div>
          )}
          
          {/* TAB 2: FIND RIDE */}
          {activeTab === 'find-ride' && (
            <motion.div
              key="find-ride-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div>
                  <h2 className="text-2xl font-extrabold text-primary-text">Search Available Rides</h2>
                  <p className="text-xs text-secondary-text">Filter through verified commutes driving to your destination.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      triggerMockNotification("Please login using the button at the top right to request a ride!");
                    } else {
                      setIsRequestRideOpen(true);
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-md w-fit"
                >
                  <PlusCircle size={15} /> Request a Ride
                </button>
              </div>

              {/* Filtering form */}
              <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Leaving from</label>
                    <input
                      type="text"
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      placeholder="e.g. Kochi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Going to</label>
                    <input
                      type="text"
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      placeholder="e.g. Kannur"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Departure Date</label>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary-blue text-white font-bold text-xs rounded-xl hover:bg-dark-blue hover:shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    Apply Filters
                  </button>
                </form>
              </div>

              {/* Rides listing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rides.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white border border-brand-border rounded-3xl space-y-4">
                    <Info size={40} className="text-slate-400 mx-auto" />
                    <div>
                      <p className="text-base font-bold text-primary-text">No rides found for this route.</p>
                      <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1">
                        Nobody is offering seats on this route right now. Why not offer a ride yourself and cover your fuel expenses?
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-2 items-center">
                      <button 
                        onClick={() => {
                          if (!user) {
                            triggerMockNotification("Please login using the button at the top right to offer a ride!");
                          } else {
                            setActiveTab('offer-ride');
                          }
                        }}
                        className="px-5 py-2.5 bg-primary-blue hover:bg-dark-blue text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary-blue/20"
                      >
                        Offer Your Own Ride
                      </button>
                      <button 
                        onClick={() => {
                          if (!user) {
                            triggerMockNotification("Please login using the button at the top right to request a ride!");
                          } else {
                            setIsRequestRideOpen(true);
                          }
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                      >
                        Request a Ride
                      </button>
                    </div>
                    
                    <div>
                      <button 
                        onClick={() => { setSearchFrom(''); setSearchTo(''); setSearchDate(''); fetchRides(); }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 underline mt-2"
                      >
                        Reset Search
                      </button>
                    </div>
                  </div>
                ) : (
                  rides.map((ride) => (
                    <div 
                      key={ride.id} 
                      onClick={() => setSelectedRideForBooking(ride)} 
                      className="cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                      <RideCard
                        ride={ride}
                        onBook={() => setSelectedRideForBooking(ride)}
                        bookingStatus={bookingStatusMap[ride.id] || 'none'}
                      />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: OFFER RIDE (WITH INLINE DRIVER VERIFICATION STEPPER) */}
          {activeTab === 'offer-ride' && (
            <motion.div
              key="offer-ride-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-xl mx-auto px-4 py-10 space-y-8"
            >
              {user && !user.governmentIdVerified ? (
                // DRIVER VERIFICATION STEPPER WIZARD
                <div className="bg-white border border-brand-border rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="text-center space-y-2">
                    <span className="px-3 py-1 bg-blue-50 text-primary-blue border border-blue-100 rounded-full text-[9px] font-extrabold uppercase tracking-widest">
                      Quick Driver Verification
                    </span>
                    <h2 className="text-2xl font-extrabold text-primary-text">Driver Registration</h2>
                    <p className="text-xs text-secondary-text max-w-sm mx-auto">
                      Complete this 4-step registration to activate your driver status and publish trips.
                    </p>
                  </div>

                  {/* Stepper Progress bar */}
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border text-[10px] font-bold text-slate-400">
                    <span className={verificationStep === 1 ? 'text-primary-blue font-extrabold' : ''}>1. Selfie</span>
                    <span>➔</span>
                    <span className={verificationStep === 2 ? 'text-primary-blue font-extrabold' : ''}>2. License</span>
                    <span>➔</span>
                    <span className={verificationStep === 3 ? 'text-primary-blue font-extrabold' : ''}>3. Vehicle Reg</span>
                    <span>➔</span>
                    <span className={verificationStep === 4 ? 'text-primary-blue font-extrabold' : ''}>4. Phone OTP</span>
                  </div>

                  <form onSubmit={handleDriverVerificationSubmit} className="space-y-5">
                    
                    {/* Step 1: Profile Photo (Selfie) */}
                    {verificationStep === 1 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-700">Step 1: Upload Profile Selfie Photo</label>
                        {driverSelfie ? (
                          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-brand-success">
                            <span className="flex items-center gap-2"><CheckCircle size={16} /> selfie_photo.jpg uploaded</span>
                            <button type="button" onClick={() => setDriverSelfie('')} className="text-slate-500 hover:text-slate-700">Reset</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDriverSelfie('driver_selfie.png')}
                            className="w-full h-32 border-2 border-dashed border-slate-200 hover:border-primary-blue rounded-2xl flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-bold hover:bg-slate-50 transition-all"
                          >
                            <Camera size={24} /> Upload Selfie Photo
                          </button>
                        )}
                      </div>
                    )}

                    {/* Step 2: Driving License */}
                    {verificationStep === 2 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-700">Step 2: Upload Valid Driving License</label>
                        {driverLicense ? (
                          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-brand-success">
                            <span className="flex items-center gap-2"><CheckCircle size={16} /> driving_license_doc.pdf</span>
                            <button type="button" onClick={() => setDriverLicense('')} className="text-slate-500 hover:text-slate-700">Reset</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDriverLicense('driving_license_doc.pdf')}
                            className="w-full h-32 border-2 border-dashed border-slate-200 hover:border-primary-blue rounded-2xl flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-bold hover:bg-slate-50 transition-all"
                          >
                            <PlusCircle size={22} className="text-slate-400" /> Upload License Document
                          </button>
                        )}
                      </div>
                    )}

                    {/* Step 3: Vehicle Registration */}
                    {verificationStep === 3 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-700">Step 3: Enter Vehicle Registration Number</label>
                        <input
                          type="text"
                          required
                          value={driverVehicleReg}
                          onChange={(e) => setDriverVehicleReg(e.target.value)}
                          placeholder="e.g. KL-07-CD-1234"
                          className="w-full px-4 py-3 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue font-semibold font-mono"
                        />
                      </div>
                    )}

                    {/* Step 4: OTP Verification */}
                    {verificationStep === 4 && (
                      <div className="space-y-4 text-center">
                        <label className="block text-xs font-bold text-slate-700 text-left">Step 4: Verify Phone Number OTP</label>
                        <p className="text-xs text-secondary-text text-left">We've sent a simulated OTP code to your number +91 ******3210.</p>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={verificationOtp}
                          onChange={(e) => setVerificationOtp(e.target.value)}
                          placeholder="123456"
                          className="w-36 text-center text-lg font-bold tracking-widest px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-primary-blue font-semibold mx-auto block"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-3">
                      {verificationStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setVerificationStep(verificationStep - 1)}
                          className="flex-1 py-3 border border-brand-border text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={verificationLoading}
                        className="flex-1 py-3 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center"
                      >
                        {verificationLoading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : verificationStep === 4 ? (
                          'Complete Verification'
                        ) : (
                          'Next Step'
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                // SIMPLIFIED OFFER RIDE TRIP DETAILS FORM
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-extrabold text-primary-text">Offer Your Ride</h2>
                    <p className="text-xs text-secondary-text">List your route details, set price, and split trip expenses.</p>
                  </div>

                  <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm">
                    <form onSubmit={handlePublishRide} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Leaving from</label>
                          <input
                            type="text"
                            value={publishFrom}
                            onChange={(e) => setPublishFrom(e.target.value)}
                            placeholder="e.g. Kochi"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Going to</label>
                          <input
                            type="text"
                            value={publishTo}
                            onChange={(e) => setPublishTo(e.target.value)}
                            placeholder="e.g. Kannur"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Departure Date</label>
                          <input
                            type="date"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Departure Time</label>
                          <input
                            type="time"
                            value={publishTime}
                            onChange={(e) => setPublishTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Available Seats</label>
                          <input
                            type="number"
                            min={1}
                            max={8}
                            value={publishSeats}
                            onChange={(e) => setPublishSeats(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Ride Contribution (₹)</label>
                          <input
                            type="number"
                            min={10}
                            value={publishPrice}
                            onChange={(e) => setPublishPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Vehicle Details</label>
                        <input
                          type="text"
                          placeholder="e.g. Tesla Model 3 (Blue)"
                          value={publishVehicle}
                          onChange={(e) => setPublishVehicle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-sm rounded-xl hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center"
                      >
                        Share My Ride
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 4: SAFETY */}
          {activeTab === 'safety' && (
            <motion.div
              key="safety-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-3xl mx-auto px-4 py-12 space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary-text">Safety Guidelines</h2>
                <p className="text-xs text-secondary-text">Learn how RideLink protects our carpooling members.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-primary-blue rounded-2xl shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-text mb-1">Emergency SOS Button</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      All trips contain an in-app emergency SOS button inside the tracking screen. Activating it shares your live coordinates with emergency contacts and notifies nearby security systems instantly.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-brand-success rounded-2xl shrink-0">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-text mb-1">ID Verification Badges</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      Members matching their profile name with state registration cards (such as Passport or Driver License) receive verified ID badges, building confidence across the platform.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardView />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* NEW BOOKING REQUEST FLOW DIALOG MODAL */}
      {selectedRideForBooking && (
        <BookingRequestModal 
          ride={selectedRideForBooking} 
          onClose={() => setSelectedRideForBooking(null)}
          onSubmitBooking={handleBookingSubmission}
          onNavigateToDashboard={() => {
            setSelectedRideForBooking(null);
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* SMART GUIDANCE ONBOARDING MODAL */}
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />

      {/* PASSENGER RIDE REQUEST FORM MODAL */}
      <AnimatePresence>
        {isRequestRideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-lg w-full relative overflow-hidden"
            >
              <button 
                onClick={() => setIsRequestRideOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-secondary-text hover:bg-slate-100 transition-all z-20"
              >
                <X size={18} />
              </button>

              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-6 border-b border-brand-border pt-7">
                <h3 className="text-lg font-extrabold text-primary-text flex items-center gap-2">
                  🙋 Request a Ride
                </h3>
                <p className="text-xs text-secondary-text mt-1">
                  Tell drivers where you want to go. Drivers planning the same route can see your request and offer you a seat.
                </p>
              </div>

              <form onSubmit={handleRequestRideSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Leaving from</label>
                    <input
                      type="text"
                      required
                      value={requestFrom}
                      onChange={(e) => setRequestFrom(e.target.value)}
                      placeholder="e.g. Kochi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Going to</label>
                    <input
                      type="text"
                      required
                      value={requestTo}
                      onChange={(e) => setRequestTo(e.target.value)}
                      placeholder="e.g. Calicut"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Travel Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Preferred Time</label>
                    <input
                      type="time"
                      required
                      value={requestTime}
                      onChange={(e) => setRequestTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Flexible Time</label>
                    <select
                      value={requestFlexible}
                      onChange={(e) => setRequestFlexible(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    >
                      <option>±30 min</option>
                      <option>±1 hour</option>
                      <option>Any Time</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Number of Passengers</label>
                    <select
                      value={requestSeats}
                      onChange={(e) => setRequestSeats(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'passenger' : 'passengers'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Maximum Contribution (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={requestPrice}
                      onChange={(e) => setRequestPrice(parseInt(e.target.value))}
                      placeholder="e.g. 400"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Optional Note</label>
                  <textarea
                    rows={2}
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="e.g. Traveling Kochi to Calicut on 15 July around 8:00 AM. I can leave within one hour earlier or later."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue resize-none font-semibold leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 border-t border-brand-border pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestRideOpen(false)}
                    className="flex-1 py-3 border border-brand-border text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSubmitLoading}
                    className="flex-1 py-3 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
                  >
                    {requestSubmitLoading ? 'Posting...' : 'Post Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SMART ROUTE MATCHING DIALOG MODAL */}
      <AnimatePresence>
        {showMatchingBanner && matchingRequests.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-lg w-full relative overflow-hidden"
            >
              <button 
                onClick={() => { setShowMatchingBanner(false); setActiveTab('dashboard'); }}
                className="absolute top-4 right-4 p-1.5 rounded-full text-secondary-text hover:bg-slate-100 transition-all z-20"
              >
                <X size={18} />
              </button>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 p-6 border-b border-brand-border pt-7 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <h3 className="text-lg font-extrabold text-slate-800">Route Matching Alert 🟢</h3>
                </div>
                <p className="text-xs text-secondary-text mt-1">
                  We found <strong>{matchingRequests.length} passenger requests</strong> looking for a ride on your exact route! Send them an offer directly.
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
                {matchingRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 border border-brand-border rounded-2xl flex flex-col gap-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={req.passengerPhoto} alt={req.passengerName} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-bold text-slate-800">{req.passengerName}</p>
                            {req.isVerified && (
                              <ShieldCheck size={13} className="fill-blue-500 text-white" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">Rating: {req.passengerRating} ★</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-primary-blue">Max ₹{req.maxPrice}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{req.flexibleTime}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-white border border-slate-100 rounded-xl p-2.5 leading-relaxed font-semibold">
                      <p className="text-slate-800 font-bold">{req.origin} → {req.destination}</p>
                      <p className="text-[10px] text-slate-400">Date: {req.date} • Time: {req.time} • Seats: {req.seatsNeeded}</p>
                      {req.note && <p className="text-[10px] italic text-slate-500 mt-1 font-medium">"{req.note}"</p>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendOfferToPassenger(req.id, newlyCreatedRide.id)}
                        className="flex-grow py-2 bg-primary-blue hover:bg-dark-blue text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
                      >
                        Offer Ride
                      </button>
                      <button
                        onClick={() => triggerMockNotification(`Opening chat channel with ${req.passengerName}...`)}
                        className="px-4 py-2 border border-brand-border text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 border-t border-brand-border">
                <button
                  onClick={() => { setShowMatchingBanner(false); setActiveTab('dashboard'); }}
                  className="w-full py-3 bg-slate-900 text-white text-xs font-extrabold rounded-xl transition-all"
                >
                  Continue to Driver Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
