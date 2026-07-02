"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, MessageSquare, ShieldCheck, Star, 
  MapPin, Calendar, Clock, Users, Settings, Check, X, Send, Compass,
  ShieldAlert, Share2, Heart
} from 'lucide-react';
import SosDrawer from './SosDrawer';

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhoto: string;
  seatsBooked: number;
  pickupPoint: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  price: number;
  paymentStatus: string;
  ride?: Ride;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  vehicle: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  contributionAmount: number;
  seatsAvailable: number;
  status: string;
}

export interface PassengerRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhoto: string;
  passengerRating: number;
  isVerified: boolean;
  origin: string;
  destination: string;
  date: string;
  time: string;
  flexibleTime: string;
  seatsNeeded: number;
  maxPrice: number;
  note?: string;
  status: 'searching' | 'offer_received' | 'confirmed' | 'completed' | 'expired';
  offeredRideId?: string;
  offeredRide?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

// Pure helper function declared outside component to satisfy purity check rule
function getTomorrowDateString(): string {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

export default function DashboardView() {
  const { user, triggerMockNotification, updateTrustedContact } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'trips' | 'passengerRequests' | 'wallet' | 'chat' | 'settings'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeChatRideId, setActiveChatRideId] = useState<string>('ride_1');
  const [gpsProgress, setGpsProgress] = useState(0.2);

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isShareTripOpen, setIsShareTripOpen] = useState(false);
  const [showSafeArrivalPopup, setShowSafeArrivalPopup] = useState(false);
  const [safeArrivalConfirmed, setSafeArrivalConfirmed] = useState(false);
  const [trustedContactFormOpen, setTrustedContactFormOpen] = useState(false);

  // Initialize input states directly from authenticated user values
  const [contactName, setContactName] = useState(user?.trustedContact?.name || '');
  const [contactRelation, setContactRelation] = useState(user?.trustedContact?.relationship || 'Mother');
  const [contactPhone, setContactPhone] = useState(user?.trustedContact?.phone || '');

  const mockDriverName = "Alex Johnson";
  const mockDriverVehicle = "Tesla Model 3 (Midnight Blue)";
  const mockDriverReg = "KL-07-CD-1234";

  const [passengerRequests, setPassengerRequests] = useState<PassengerRequest[]>([]);
  const [selectedRequestForOffer, setSelectedRequestForOffer] = useState<PassengerRequest | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOfferRideId, setSelectedOfferRideId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const bookingsRes = await api.getBookings();
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        const ridesRes = await api.searchRides({});
        if (ridesRes.success) setRides(ridesRes.rides);
        const reqsRes = await api.getPassengerRequests();
        if (reqsRes.success) setPassengerRequests(reqsRes.requests);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [user]);

  // Sync state if user loads asynchronously after component mounts
  useEffect(() => {
    if (user?.trustedContact && !contactName && !contactPhone) {
      setContactName(user.trustedContact.name);
      setContactPhone(user.trustedContact.phone);
      setContactRelation(user.trustedContact.relationship);
    }
  }, [user, contactName, contactPhone]);

  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await api.getMessages(activeChatRideId);
        if (res.success) setChatMessages(res.messages);
      } catch (err) {
        console.error(err);
      }
    }
    fetchChat();
  }, [user, activeChatRideId]);

  const handleBookingAction = async (bookingId: string, action: 'accepted' | 'rejected') => {
    try {
      const res = await api.updateBookingStatus(bookingId, { status: action });
      if (res.success) {
        triggerMockNotification(`Booking request ${action === 'accepted' ? 'accepted' : 'rejected'} successfully.`);
        const bookingsRes = await api.getBookings();
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        const ridesRes = await api.searchRides({});
        if (ridesRes.success) setRides(ridesRes.rides);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !user) return;
    try {
      const res = await api.sendMessage(activeChatRideId, currentMessage);
      if (res.success) {
        setChatMessages(prev => [...prev, res.message]);
        setCurrentMessage('');
        if (!user.isDriver) {
          setTimeout(() => {
            const reply = {
              id: `msg_reply_${Date.now()}`,
              rideId: activeChatRideId,
              senderId: "user_1",
              senderName: "Alex Johnson",
              text: "Got it! See you soon. I am on my way.",
              timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, reply]);
            triggerMockNotification("New message from Alex Johnson");
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = () => {
    triggerMockNotification("Withdrawal request of ₹450 submitted successfully to your bank account.");
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    updateTrustedContact({ name: contactName, relationship: contactRelation, phone: contactPhone });
    setTrustedContactFormOpen(false);
    triggerMockNotification(`Trusted contact ${contactName} saved successfully!`);
  };

  const handleAcceptDriverOffer = async (requestId: string) => {
    try {
      const res = await api.updatePassengerRequest(requestId, { action: 'accept_offer' });
      if (res.success) {
        triggerMockNotification("Driver's offer accepted! Booking created.");
        
        // Reload all data
        const bookingsRes = await api.getBookings();
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        const reqsRes = await api.getPassengerRequests();
        if (reqsRes.success) setPassengerRequests(reqsRes.requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendOfferModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferRideId || !selectedRequestForOffer) return;
    try {
      const res = await api.updatePassengerRequest(selectedRequestForOffer.id, {
        action: 'send_offer',
        offeredRideId: selectedOfferRideId
      });
      if (res.success) {
        triggerMockNotification("Ride offer sent successfully to the passenger!");
        setIsOfferModalOpen(false);
        setSelectedRequestForOffer(null);
        setSelectedOfferRideId('');
        
        // Reload requests
        const reqsRes = await api.getPassengerRequests();
        if (reqsRes.success) setPassengerRequests(reqsRes.requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOneTapRepost = async (requestId: string) => {
    const tomorrowStr = getTomorrowDateString();
    try {
      const res = await api.updatePassengerRequest(requestId, {
        action: 'repost',
        date: tomorrowStr,
        time: '08:00'
      });
      if (res.success) {
        triggerMockNotification("Ride request successfully reposted for tomorrow!");
        
        // Reload requests
        const reqsRes = await api.getPassengerRequests();
        if (reqsRes.success) setPassengerRequests(reqsRes.requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSafeArrivalYes = () => {
    setShowSafeArrivalPopup(false);
    setSafeArrivalConfirmed(true);
    triggerMockNotification(`Safe arrival notification dispatched to ${user?.trustedContact?.name || 'trusted contact'}!`);
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Compass className="text-primary-blue animate-spin mb-4" size={48} />
        <h3 className="text-xl font-bold">Please Login to view your Dashboard</h3>
        <p className="text-sm text-secondary-text max-w-sm mt-1">
          Use the button on the top right navigation bar to log in or create an account.
        </p>
      </div>
    );
  }

  const driverActiveRides = rides.filter(r => r.driverId === user.id);
  const totalEarnings = bookings
    .filter(b => b.status === 'accepted' && b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.price, 0);

  const getTimelineStepIndex = (progress: number) => {
    if (progress <= 0.2) return 3;
    if (progress < 1.0) return 4;
    return 5;
  };
  const currentTimelineIndex = getTimelineStepIndex(gpsProgress);

  const visualTimelineSteps = [
    { label: "Search Ride", desc: "Route details entered" },
    { label: "Request Sent", desc: "Waiting for approval" },
    { label: "Driver Accepted", desc: "Confirmed by driver" },
    { label: "Meet at Pickup", desc: "Arranging meetup" },
    { label: "Trip Started", desc: "On the route" },
    { label: "Trip Completed", desc: "Arrived safely" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 bg-white border border-brand-border rounded-3xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border mb-3">
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            />
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-primary-text">{user.name}</p>
                {user.isDriver && user.governmentIdVerified && (
                  <ShieldCheck size={14} className="fill-blue-500 text-white" aria-label="Verified Driver" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${user.isDriver ? 'bg-primary-blue' : 'bg-brand-success'}`}></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {user.isDriver ? 'Driver Mode' : 'Passenger Mode'}
                </span>
              </div>
            </div>
          </div>

          {(['overview', 'trips', ...(user.isDriver ? ['passengerRequests', 'wallet'] : []), 'chat', 'settings'] as const).map((tab) => {
            const icons: Record<string, React.ReactNode> = {
              overview: <Compass size={18} />,
              trips: <Calendar size={18} />,
              passengerRequests: <Users size={18} />,
              wallet: <CreditCard size={18} />,
              chat: <MessageSquare size={18} />,
              settings: <Settings size={18} />
            };
            const labels: Record<string, string> = {
              overview: 'Overview',
              trips: user.isDriver ? 'My Offers' : 'My Bookings',
              passengerRequests: 'Passenger Requests',
              wallet: 'Earnings & Wallet',
              chat: 'In-App Messages',
              settings: 'Profile & Settings'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab as any)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeSubTab === tab ? 'bg-primary-blue/5 text-primary-blue' : 'text-secondary-text hover:text-primary-text hover:bg-slate-50'}`}
              >
                {icons[tab]}
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Dashboard Main Content */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Analytics Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-secondary-text mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">Account Rating</span>
                    <Star size={18} className="fill-amber-400 stroke-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-primary-text">{user.rating}</span>
                    <span className="text-xs text-secondary-text">/ 5.0</span>
                  </div>
                  <p className="text-[10px] text-brand-success font-bold mt-2">✓ Verified Profile Status</p>
                </div>

                <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-secondary-text mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {user.isDriver ? 'Active Offered Rides' : 'Booked Rides'}
                    </span>
                    <Compass size={18} className="text-primary-blue" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-primary-text">
                      {user.isDriver ? driverActiveRides.length : bookings.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">All routes active</p>
                </div>

                <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-secondary-text mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {user.isDriver ? 'Wallet Balance' : 'Total Trips Shared'}
                    </span>
                    <CreditCard size={18} className="text-brand-success" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-primary-text">
                      {user.isDriver ? `₹${totalEarnings || 450}` : `${bookings.length}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">
                    {user.isDriver ? 'Direct deposit active' : 'Saved ₹1,200 on fuel'}
                  </p>
                </div>
              </div>

              {user.isDriver ? (
                // DRIVER DASHBOARD
                <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-primary-text">Passenger Booking Requests</h3>
                    <p className="text-xs text-secondary-text">Approve or decline requests for your upcoming trips.</p>
                  </div>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'pending').length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-brand-border">
                        <Users size={32} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-secondary-text">No pending passenger requests</p>
                        <p className="text-xs text-slate-400 mt-0.5">They'll show up here when passengers book.</p>
                      </div>
                    ) : (
                      bookings.filter(b => b.status === 'pending').map((booking) => (
                        <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-brand-border rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                              {booking.passengerName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-primary-text">{booking.passengerName}</p>
                              <p className="text-xs text-secondary-text">
                                Wants <strong className="text-slate-700">{booking.seatsBooked} seat</strong> • Contribution: <strong className="text-primary-blue">₹{booking.price}</strong>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button onClick={() => handleBookingAction(booking.id, 'accepted')}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2 bg-brand-success text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors">
                              <Check size={14} /> Accept
                            </button>
                            <button onClick={() => handleBookingAction(booking.id, 'rejected')}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300 transition-colors">
                              <X size={14} /> Decline
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // PASSENGER DASHBOARD
                <div className="space-y-6">
                  
                  {/* Live Progress Card */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-primary-text">Live Ride Progress</h3>
                        <p className="text-xs text-secondary-text">Live tracking details for your current active trip.</p>
                      </div>
                      <button
                        onClick={() => setIsSosOpen(true)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-red-500/20"
                      >
                        <ShieldAlert size={14} className="animate-pulse" /> SOS Emergency
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-blue" /> Kochi</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-success" /> Kannur</span>
                      </div>
                      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '0%' }}
                          animate={{ width: `${gpsProgress * 100}%` }}
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary-blue to-brand-success"
                        />
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-semibold">Estimated Arrival</p>
                          <p className="text-sm font-bold text-white">
                            {gpsProgress >= 1.0 ? 'Arrived safely ✅' : '12:30 PM (2h remaining)'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsShareTripOpen(true)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                          >
                            <Share2 size={12} /> Share My Trip
                          </button>
                          <button 
                            onClick={() => setGpsProgress(prev => {
                              const nextVal = Math.min(1.0, parseFloat((prev + 0.2).toFixed(1)));
                              if (nextVal >= 1.0 && !safeArrivalConfirmed) {
                                setShowSafeArrivalPopup(true);
                              }
                              return nextVal;
                            })}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700"
                          >
                            Advance GPS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Ride Requests Section */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-primary-text">My Ride Requests</h3>
                        <p className="text-xs text-secondary-text">Track requests you posted for routes where no rides were available.</p>
                      </div>
                    </div>

                    {passengerRequests.filter(r => r.passengerId === user.id).length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-brand-border">
                        <Users size={32} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-secondary-text">No active ride requests</p>
                        <p className="text-xs text-slate-400 mt-0.5">Post a request on the home or search page if you can't find a driver.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {passengerRequests.filter(r => r.passengerId === user.id).map((req) => {
                          const statusColors: Record<string, string> = {
                            searching: 'bg-blue-50 text-primary-blue border-blue-100',
                            offer_received: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
                            confirmed: 'bg-emerald-50 text-brand-success border-emerald-200',
                            completed: 'bg-slate-100 text-slate-500 border-slate-200',
                            expired: 'bg-red-50 text-red-600 border-red-200'
                          };
                          const statusLabels: Record<string, string> = {
                            searching: 'Searching for Driver',
                            offer_received: 'Offer Received ⚡',
                            confirmed: 'Ride Confirmed',
                            completed: 'Trip Completed',
                            expired: 'Expired'
                          };

                          let activeStepIdx = 0;
                          if (req.status === 'offer_received') activeStepIdx = 1;
                          if (req.status === 'confirmed') activeStepIdx = 2;
                          if (req.status === 'completed') activeStepIdx = 3;

                          const steps = ["Searching", "Offer Received", "Confirmed", "Completed"];

                          return (
                            <div key={req.id} className="p-5 bg-slate-50 border border-brand-border rounded-2xl space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-slate-800">{req.origin} → {req.destination}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${statusColors[req.status] || 'bg-slate-100'}`}>
                                      {statusLabels[req.status] || req.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-secondary-text mt-0.5">
                                    Date: {req.date} at {req.time} • {req.seatsNeeded} {req.seatsNeeded === 1 ? 'Seat' : 'Seats'} • Max Contribution: ₹{req.maxPrice}
                                  </p>
                                </div>
                                {req.status === 'expired' && (
                                  <button
                                    onClick={() => handleOneTapRepost(req.id)}
                                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all"
                                  >
                                    Repost with One Tap 🔄
                                  </button>
                                )}
                              </div>

                              {/* Progress bar timeline */}
                              {req.status !== 'expired' && (
                                <div className="relative flex items-center justify-between pt-1 pb-2">
                                  <div className="absolute left-2 right-2 top-3 h-0.5 bg-slate-200 z-0" />
                                  <div 
                                    className="absolute left-2 top-3 h-0.5 bg-primary-blue transition-all duration-305 z-0" 
                                    style={{ width: `${(activeStepIdx / (steps.length - 1)) * 96}%` }}
                                  />
                                  {steps.map((step, idx) => {
                                    const isDone = idx < activeStepIdx;
                                    const isActive = idx === activeStepIdx;
                                    return (
                                      <div key={idx} className="flex flex-col items-center relative z-10">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                                          isDone ? 'bg-brand-success text-white border-brand-success' : isActive ? 'bg-primary-blue text-white border-primary-blue ring-4 ring-blue-100' : 'bg-white text-slate-400 border-slate-200'
                                        }`}>
                                          {isDone ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[8px] font-bold mt-1 ${isActive ? 'text-primary-blue' : 'text-slate-400'}`}>{step}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Offered Ride Details */}
                              {req.status === 'offer_received' && req.offeredRide && (
                                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <img src={req.offeredRide.driverPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"} alt={req.offeredRide.driverName} className="w-8 h-8 rounded-full object-cover" />
                                      <div>
                                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                          {req.offeredRide.driverName}
                                          <ShieldCheck size={12} className="fill-blue-500 text-white" />
                                        </p>
                                        <span className="text-[9px] text-slate-400 font-semibold">{req.offeredRide.vehicle} • {req.offeredRide.driverRating} ★</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-extrabold text-amber-700">₹{req.offeredRide.contributionAmount} / Seat</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAcceptDriverOffer(req.id)}
                                      className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all"
                                    >
                                      Accept Offer & Book Seat
                                    </button>
                                    <button
                                      onClick={() => triggerMockNotification("Offer dismissed.")}
                                      className="px-3 py-2 border border-slate-300 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-white"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Trusted Contact Card */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center gap-2">
                        <Heart size={18} className="text-red-500" />
                        <div>
                          <h4 className="text-sm font-bold text-primary-text">Saved Trusted Contact</h4>
                          <p className="text-[10px] text-secondary-text">Family or friends notified during active journeys</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTrustedContactFormOpen(true)}
                        className="text-xs font-bold text-primary-blue hover:underline"
                      >
                        {user.trustedContact ? 'Edit Contact' : 'Add Contact'}
                      </button>
                    </div>

                    {user.trustedContact ? (
                      <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{user.trustedContact.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{user.trustedContact.relationship} • {user.trustedContact.phone}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-brand-success px-2 py-0.5 rounded border border-emerald-100 font-bold">Active Security Guard</span>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed text-xs text-secondary-text">
                        <p>No trusted contact added yet.</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Add a loved one so they can track your trip and verify your safety.</p>
                        <button
                          onClick={() => setTrustedContactFormOpen(true)}
                          className="mt-2.5 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg"
                        >
                          Setup Trusted Contact
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Trip Timeline */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-base font-bold text-primary-text">Trip Timeline</h4>
                      <p className="text-xs text-secondary-text">Current status of your booking and journey.</p>
                    </div>

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 pt-2">
                      <div className="absolute top-[22px] left-6 right-6 h-0.5 bg-slate-200 hidden md:block" />
                      <div 
                        className="absolute top-[22px] left-6 h-0.5 bg-brand-success transition-all duration-500 hidden md:block" 
                        style={{ width: `${Math.min((currentTimelineIndex / (visualTimelineSteps.length - 1)) * 94, 94)}%` }}
                      />

                      {visualTimelineSteps.map((step, idx) => {
                        const isDone = idx < currentTimelineIndex;
                        const isActive = idx === currentTimelineIndex;
                        return (
                          <div key={idx} className="flex md:flex-col items-center md:text-center relative z-10 flex-1 gap-3 md:gap-0">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-white ${
                              isDone ? 'bg-brand-success text-white' : isActive ? 'bg-primary-blue text-white ring-blue-100 animate-pulse' : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <div className="md:mt-3.5 text-left md:text-center space-y-0.5">
                              <p className={`text-xs font-bold ${isActive ? 'text-primary-blue' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {step.label}
                              </p>
                              <p className="text-[9px] text-slate-400 font-semibold">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRIPS */}
          {activeSubTab === 'trips' && (
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary-text">
                  {user.isDriver ? 'My Offered Rides' : 'My Travel Bookings'}
                </h3>
                <p className="text-xs text-secondary-text">Manage all details for your upcoming and past routes.</p>
              </div>
              <div className="space-y-4">
                {user.isDriver ? (
                  driverActiveRides.length === 0 ? (
                    <p className="text-sm text-secondary-text text-center py-6">You haven't offered any rides yet.</p>
                  ) : (
                    driverActiveRides.map((ride) => (
                      <div key={ride.id} className="p-4 bg-slate-50 border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-800">{ride.origin} → {ride.destination}</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-primary-blue rounded-md uppercase">{ride.status}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-secondary-text">
                            <span className="flex items-center gap-1"><Calendar size={13} /> {ride.date}</span>
                            <span className="flex items-center gap-1"><Clock size={13} /> {ride.time}</span>
                            <span className="flex items-center gap-1"><Users size={13} /> {ride.seatsAvailable} seats</span>
                          </div>
                        </div>
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                          <span className="text-lg font-extrabold text-primary-blue">₹{ride.contributionAmount}</span>
                          <span className="text-[10px] text-secondary-text">per seat</span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  bookings.length === 0 ? (
                    <p className="text-sm text-secondary-text text-center py-6">You haven't booked any rides yet.</p>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="p-4 bg-slate-50 border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-800">
                              {booking.ride ? `${booking.ride.origin} → ${booking.ride.destination}` : 'Kochi → Kannur'}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${booking.status === 'accepted' ? 'bg-emerald-50 text-brand-success' : booking.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-secondary-text">
                            <span className="flex items-center gap-1"><Calendar size={13} /> {booking.ride ? booking.ride.date : 'Today'}</span>
                            <span className="flex items-center gap-1"><Clock size={13} /> {booking.ride ? booking.ride.time : '08:00 AM'}</span>
                          </div>
                        </div>
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                          <span className="text-lg font-extrabold text-slate-800">₹{booking.price}</span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">{booking.paymentStatus}</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WALLET */}
          {activeSubTab === 'wallet' && user.isDriver && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-blue to-dark-blue rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Available Balance</p>
                <h3 className="text-4xl font-extrabold mt-1">₹450.00</h3>
                <div className="flex items-center gap-4 mt-6">
                  <button onClick={handleWithdraw} className="px-5 py-2.5 bg-white text-primary-blue font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors">
                    Withdraw to Bank
                  </button>
                  <button className="px-5 py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                    View Statements
                  </button>
                </div>
              </div>
              <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-primary-text">Recent Transactions</h4>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-brand-border">
                    <div>
                      <p className="font-bold text-slate-800">Fuel Contribution from Sarah M.</p>
                      <p className="text-[10px] text-secondary-text">Kochi → Kannur route</p>
                    </div>
                    <span className="font-extrabold text-brand-success">+₹450.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-brand-border">
                    <div>
                      <p className="font-bold text-slate-800">Fuel Contribution from Alex G.</p>
                      <p className="text-[10px] text-secondary-text">Trivandrum → Kochi route</p>
                    </div>
                    <span className="font-extrabold text-brand-success">+₹320.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PASSENGER REQUESTS */}
          {activeSubTab === 'passengerRequests' && user.isDriver && (
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary-text">Passenger Travel Requests</h3>
                <p className="text-xs text-secondary-text">These passengers need a ride on routes you might be driving. Send them an offer.</p>
              </div>

              <div className="space-y-4">
                {passengerRequests.filter(r => r.status === 'searching').length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 border border-brand-border rounded-2xl border-dashed">
                    <Users size={36} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-secondary-text">No active passenger requests</p>
                    <p className="text-xs text-slate-400 mt-0.5">When passengers request rides on the platform, they'll show up here.</p>
                  </div>
                ) : (
                  passengerRequests.filter(r => r.status === 'searching').map((req) => (
                    <div key={req.id} className="p-5 bg-slate-50 border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center gap-3">
                          <img src={req.passengerPhoto} alt={req.passengerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-primary-text">{req.passengerName}</p>
                              {req.isVerified && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-[9px] font-bold text-primary-blue rounded-md border border-blue-100">
                                  <ShieldCheck size={11} className="fill-blue-500 text-white" /> Verified Passenger
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-semibold">
                              <span className="flex items-center gap-0.5"><Star size={11} className="fill-amber-400 stroke-amber-400" /> {req.passengerRating} Rating</span>
                              <span>•</span>
                              <span>Requested {req.seatsNeeded} {req.seatsNeeded === 1 ? 'seat' : 'seats'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200/60 p-3 rounded-xl text-xs space-y-1.5 max-w-lg">
                          <p className="font-bold text-slate-800">{req.origin} → {req.destination}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Date: {req.date} • Time: {req.time} ({req.flexibleTime})</p>
                          {req.note && <p className="text-[10px] text-slate-500 italic mt-1 font-medium">"{req.note}"</p>}
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end justify-between gap-2.5 sm:text-right shrink-0">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Max Contribution</span>
                          <span className="text-xl font-extrabold text-primary-blue font-mono">₹{req.maxPrice}</span>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              setSelectedRequestForOffer(req);
                              const driverRides = rides.filter(r => r.driverId === user.id);
                              if (driverRides.length > 0) {
                                setSelectedOfferRideId(driverRides[0].id);
                              }
                              setIsOfferModalOpen(true);
                            }}
                            className="flex-grow sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
                          >
                            Offer Ride
                          </button>
                          <button
                            onClick={() => {
                              setActiveSubTab('chat');
                              triggerMockNotification(`Opened chat channel with ${req.passengerName}`);
                            }}
                            className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHAT */}
          {activeSubTab === 'chat' && (
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[550px]">
              <div className="md:col-span-4 border-r border-brand-border pr-4 space-y-3">
                <h4 className="text-sm font-bold text-primary-text mb-4">Chat Channels</h4>
                <button 
                  onClick={() => setActiveChatRideId('ride_1')}
                  className={`flex w-full items-center gap-3 p-3 rounded-2xl text-left border ${activeChatRideId === 'ride_1' ? 'bg-primary-blue/5 border-primary-blue/20' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {user.isDriver ? 'S' : 'A'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-primary-text">{user.isDriver ? 'Sarah Miller' : 'Alex Johnson'}</p>
                    <p className="text-[10px] text-secondary-text truncate">Kochi → Kannur ride chat</p>
                  </div>
                </button>
              </div>

              <div className="md:col-span-8 flex flex-col justify-between">
                <div className="space-y-3.5 overflow-y-auto max-h-[380px] pr-2 pb-4 flex-1">
                  {chatMessages.length === 0 ? (
                    <p className="text-xs text-center text-secondary-text py-8">No messages yet. Send a greeting!</p>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${isMe ? 'bg-primary-blue text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-secondary-text mt-1 px-1">
                            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-brand-border pt-4">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-primary-blue text-white rounded-xl hover:bg-dark-blue transition-colors flex items-center justify-center shrink-0">
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeSubTab === 'settings' && (
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary-text">Profile Settings</h3>
                <p className="text-xs text-secondary-text">Edit your details and toggle verification badges.</p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-brand-border rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider mb-1">Government ID Verification</h4>
                    <p className="text-xs text-secondary-text">Provide an ID card to unlock the "Verified User" status.</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-brand-success text-xs font-bold border border-emerald-100 rounded-xl flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified Profile
                  </span>
                </div>
                {user.isDriver && (
                  <div className="p-4 border border-brand-border rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider">Vehicle Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-secondary-text font-semibold mb-1">Vehicle Model</label>
                        <input type="text" value={user.vehicleDetails?.model || 'Tesla Model 3'} disabled className="w-full px-3.5 py-2 bg-slate-50 border border-brand-border rounded-xl text-xs text-slate-600 cursor-not-allowed font-semibold" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-secondary-text font-semibold mb-1">License Plate</label>
                        <input type="text" value={user.vehicleDetails?.plateNumber || 'KL-07-CD-1234'} disabled className="w-full px-3.5 py-2 bg-slate-50 border border-brand-border rounded-xl text-xs text-slate-600 cursor-not-allowed font-semibold" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SOS DRAWER */}
      <SosDrawer isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} trustedContact={user.trustedContact} />

      {/* SHARE TRIP MODAL */}
      <AnimatePresence>
        {isShareTripOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-sm w-full relative overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <span className="text-xs font-bold flex items-center gap-1"><Share2 size={13} className="text-primary-blue" /> Share Trip Details</span>
                <button onClick={() => setIsShareTripOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-secondary-text leading-relaxed">
                  We prepared a secure tracking link. You can send it directly to your trusted contact so they can track your ride in real-time.
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-800 shadow-sm space-y-2">
                  <p className="font-bold text-emerald-800 border-b border-emerald-100/50 pb-1">🟢 Message Preview to {user?.trustedContact?.name || 'Mom'}:</p>
                  <p>"{user.name} has started a RideLink trip from <strong>Kochi to Kannur</strong>.</p>
                  <p className="pl-2 border-l-2 border-emerald-400 text-slate-600 bg-emerald-100/30 py-1 rounded">
                    🚗 Driver: {mockDriverName} (Verified Driver ✅)<br />
                    🚘 Vehicle: {mockDriverVehicle} ({mockDriverReg})<br />
                    ⏰ ETA: 12:30 PM
                  </p>
                  <p className="text-primary-blue underline font-bold mt-1.5 break-all">http://localhost:3000/?track=ride_1</p>
                </div>
                {user.trustedContact ? (
                  <button onClick={() => { setIsShareTripOpen(false); triggerMockNotification(`Trip details shared with ${user.trustedContact?.name}!`); }}
                    className="w-full py-3 bg-brand-success hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5">
                    Send to {user.trustedContact.name} ({user.trustedContact.relationship})
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-center text-amber-600 font-bold">⚠️ No saved trusted contact found</p>
                    <button onClick={() => { setIsShareTripOpen(false); setTrustedContactFormOpen(true); }}
                      className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl">
                      Add Contact First
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRUSTED CONTACT FORM */}
      <AnimatePresence>
        {trustedContactFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-sm w-full relative overflow-hidden">
              <div className="p-6 pb-0 flex justify-between items-center">
                <h3 className="text-base font-extrabold text-primary-text">Configure Trusted Contact</h3>
                <button onClick={() => setTrustedContactFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveContact} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Contact Name</label>
                  <input type="text" required placeholder="e.g. Mary Prasad" value={contactName} onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Relationship</label>
                    <select value={contactRelation} onChange={(e) => setContactRelation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold">
                      {['Mother', 'Father', 'Brother', 'Sister', 'Husband', 'Wife', 'Friend'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input type="tel" required placeholder="+91 98765 00123" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl shadow-md">
                  Save Secure Contact
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAFE ARRIVAL POPUP */}
      <AnimatePresence>
        {showSafeArrivalPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border p-6 shadow-2xl max-w-sm w-full text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-50 text-brand-success rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <Check size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-primary-text">Have you reached safely?</h3>
                <p className="text-xs text-secondary-text leading-relaxed">Your driver has reached the final destination. Please confirm your safe arrival.</p>
              </div>
              {user.trustedContact && (
                <div className="bg-slate-50 border rounded-xl p-3 text-[9px] text-slate-500 text-left font-medium">
                  <strong>SMS Sent to {user.trustedContact.name}:</strong><br />
                  "Good news! {user.name} has safely reached Kannur. Thank you for using RideLink."
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleSafeArrivalYes} className="flex-1 py-3 bg-brand-success hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-all">
                  ✅ Yes, I'm Safe
                </button>
                <button onClick={() => { setShowSafeArrivalPopup(false); setIsSosOpen(true); }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all">
                  ⚠️ I Need Help
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRIVER OFFER RIDE SELECTION MODAL */}
      <AnimatePresence>
        {isOfferModalOpen && selectedRequestForOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border max-w-sm w-full relative overflow-hidden shadow-2xl">
              <div className="p-6 pb-0 flex justify-between items-center">
                <h3 className="text-base font-extrabold text-primary-text">Send Ride Offer</h3>
                <button onClick={() => { setIsOfferModalOpen(false); setSelectedRequestForOffer(null); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <form onSubmit={handleSendOfferModalSubmit} className="p-6 space-y-4 text-left">
                <p className="text-xs text-secondary-text leading-relaxed">
                  Select one of your published rides to offer to <strong>{selectedRequestForOffer.passengerName}</strong>:
                </p>

                {rides.filter(r => r.driverId === user.id && r.status === 'active').length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed text-xs text-slate-500">
                    You have no active rides. Create one first!
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">Your Active Rides</label>
                    <select 
                      value={selectedOfferRideId} 
                      onChange={(e) => setSelectedOfferRideId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-blue"
                    >
                      {rides.filter(r => r.driverId === user.id && r.status === 'active').map(r => (
                        <option key={r.id} value={r.id}>
                          {r.origin} → {r.destination} ({r.date} at {r.time})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={rides.filter(r => r.driverId === user.id && r.status === 'active').length === 0}
                  className="w-full py-3 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  Send Offer ⚡
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
