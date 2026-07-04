"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  Users,
  Settings,
  Check,
  X,
  Compass,
  ShieldAlert,
  Share2,
  Heart,
  Car,
  Info,
  PlusCircle,
} from "lucide-react";
import SosDrawer from "./SosDrawer";
import RideCard from "./RideCard";
import BookingRequestModal from "./BookingRequestModal";

// Pure helper function declared outside component to satisfy purity check rule
function getTomorrowDateString() {
  return new Date(Date.now() + 86400000).toISOString().split("T")[0];
}

export default function PassengerDashboard({
  onNavigate,
  defaultSubTab,
  onStartDriverVerification,
}) {
  const {
    user,
    triggerMockNotification,
    updateTrustedContact,
    toggleUserRole,
  } = useApp();
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab || "overview");
  const [showDriverVerificationPrompt, setShowDriverVerificationPrompt] =
    useState(false);
  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);
  const [bookings, setBookings] = useState([]);
  const [rides, setRides] = useState([]);
  const [gpsProgress, setGpsProgress] = useState(0.2);

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isShareTripOpen, setIsShareTripOpen] = useState(false);
  const [showSafeArrivalPopup, setShowSafeArrivalPopup] = useState(false);
  const [safeArrivalConfirmed, setSafeArrivalConfirmed] = useState(false);
  const [trustedContactFormOpen, setTrustedContactFormOpen] = useState(false);

  // Search filter states
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Booking details states
  const [selectedRideForBooking, setSelectedRideForBooking] = useState(null);
  const [bookingStatusMap, setBookingStatusMap] = useState({});

  // Initialize input states directly from authenticated user values
  const [contactName, setContactName] = useState(
    user?.trustedContact?.name || "",
  );
  const [contactRelation, setContactRelation] = useState(
    user?.trustedContact?.relationship || "Mother",
  );
  const [contactPhone, setContactPhone] = useState(
    user?.trustedContact?.phone || "",
  );

  const handleApplyFilters = async (e) => {
    e?.preventDefault();
    try {
      const res = await api.searchRides({
        origin: searchFrom,
        destination: searchTo,
        date: searchDate,
      });
      if (res.success) {
        setRides(res.rides);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmission = async (seats, pickup, message) => {
    if (!user) return { success: false };
    try {
      const res = await api.createBooking({
        rideId: selectedRideForBooking.id,
        seatsBooked: seats,
      });
      if (res.success) {
        setBookingStatusMap((prev) => ({
          ...prev,
          [selectedRideForBooking.id]: "pending",
        }));
        triggerMockNotification(
          "Booking request sent! Waiting for driver's approval.",
        );
        refreshData();
        return res;
      }
      return { success: false };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  const mockDriverName = "Alex Johnson";
  const mockDriverVehicle = "Tesla Model 3 (Midnight Blue)";
  const mockDriverReg = "KL-07-CD-1234";

  const [passengerRequests, setPassengerRequests] = useState([]);
  const [selectedRequestForOffer, setSelectedRequestForOffer] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOfferRideId, setSelectedOfferRideId] = useState("");

  const refreshData = async () => {
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
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Sync state if user loads asynchronously after component mounts
  useEffect(() => {
    if (user?.trustedContact && !contactName && !contactPhone) {
      setContactName(user.trustedContact.name);
      setContactPhone(user.trustedContact.phone);
      setContactRelation(user.trustedContact.relationship);
    }
  }, [user, contactName, contactPhone]);

  const handleBookingAction = async (bookingId, action) => {
    try {
      const res = await api.updateBookingStatus(bookingId, { status: action });
      if (res.success) {
        triggerMockNotification(
          `Booking request ${action === "accepted" ? "accepted" : "rejected"} successfully.`,
        );
        const bookingsRes = await api.getBookings();
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        const ridesRes = await api.searchRides({});
        if (ridesRes.success) setRides(ridesRes.rides);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishRide = async (e) => {
    e.preventDefault();
    if (!user) return;
    setPublishLoading(true);
    try {
      const res = await api.createRide({
        origin: publishFrom,
        destination: publishTo,
        date: publishDate,
        time: publishTime,
        seatsAvailable: parseInt(publishSeats),
        contributionAmount: parseInt(publishPrice),
        vehicle: user.vehicleDetails?.model || "Tesla Model 3",
        womenOnly: false,
      });
      if (res.success) {
        // Reset form
        setPublishFrom("");
        setPublishTo("");
        setPublishDate("");
        setPublishTime("08:00");
        setPublishSeats("3");
        setPublishPrice("500");
        triggerMockNotification("Ride published successfully!");
        refreshData();
        setActiveSubTab("trips"); // Switch to My Offers list
      }
    } catch (err) {
      console.error(err);
      triggerMockNotification("Failed to publish ride. Please check details.");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    updateTrustedContact({
      name: contactName,
      relationship: contactRelation,
      phone: contactPhone,
    });
    setTrustedContactFormOpen(false);
    triggerMockNotification(
      `Trusted contact ${contactName} saved successfully!`,
    );
  };

  const handleAcceptDriverOffer = async (requestId) => {
    try {
      const res = await api.updatePassengerRequest(requestId, {
        action: "accept_offer",
      });
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

  const handleSendOfferModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfferRideId || !selectedRequestForOffer) return;
    try {
      const res = await api.updatePassengerRequest(selectedRequestForOffer.id, {
        action: "send_offer",
        offeredRideId: selectedOfferRideId,
      });
      if (res.success) {
        triggerMockNotification(
          "Ride offer sent successfully to the passenger!",
        );
        setIsOfferModalOpen(false);
        setSelectedRequestForOffer(null);
        setSelectedOfferRideId("");
        // Reload requests
        const reqsRes = await api.getPassengerRequests();
        if (reqsRes.success) setPassengerRequests(reqsRes.requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOneTapRepost = async (requestId) => {
    const tomorrowStr = getTomorrowDateString();
    try {
      const res = await api.updatePassengerRequest(requestId, {
        action: "repost",
        date: tomorrowStr,
        time: "08:00",
      });
      if (res.success) {
        triggerMockNotification(
          "Ride request successfully reposted for tomorrow!",
        );
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
    triggerMockNotification(
      `Safe arrival notification dispatched to ${user?.trustedContact?.name || "trusted contact"}!`,
    );
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Compass className="text-primary-blue animate-spin mb-4" size={48} />
        <h3 className="text-xl font-bold">
          Please Login to view your Dashboard
        </h3>
        <p className="text-sm text-secondary-text max-w-sm mt-1">
          Use the button on the top right navigation bar to log in or create an
          account.
        </p>
      </div>
    );
  }

  const driverActiveRides = rides.filter((r) => r.driverId === user.id);
  const totalEarnings = bookings
    .filter((b) => b.status === "accepted" && b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.price, 0);

  const getTimelineStepIndex = (progress) => {
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
    { label: "Trip Completed", desc: "Arrived safely" },
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
                <p className="text-sm font-bold text-primary-text">
                  {user.name}
                </p>
                {user.isDriver && user.governmentIdVerified && (
                  <ShieldCheck
                    size={14}
                    className="fill-blue-500 text-white"
                    aria-label="Verified Driver"
                  />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${user.isDriver ? "bg-primary-blue" : "bg-brand-success"}`}
                ></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {user.isDriver ? "Driver Mode" : "Passenger Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Switch Role Button */}
          <div className="px-1 mb-2">
            <button
              onClick={() => {
                if (user.governmentIdVerified) {
                  toggleUserRole();
                } else {
                  setShowDriverVerificationPrompt(true);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-blue hover:bg-dark-blue text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-primary-blue/10"
            >
              🚗 Switch to Driver Mode
            </button>
          </div>

          {(() => {
            const subtabsList = [
              "overview",
              "trips",
              "trustedContacts",
              "settings",
            ];

            const icons = {
              overview: <Compass size={18} />,
              trips: <Calendar size={18} />,
              trustedContacts: <ShieldCheck size={18} />,
              settings: <Settings size={18} />,
            };

            const labels = {
              overview: "Overview",
              trips: "My Bookings",
              trustedContacts: "Trusted Contacts",
              settings: "Profile & Settings",
            };

            return subtabsList.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeSubTab === tab ? "bg-primary-blue/5 text-primary-blue" : "text-secondary-text hover:text-primary-text hover:bg-slate-50"}`}
              >
                {icons[tab]}
                {labels[tab]}
              </button>
            ));
          })()}
        </div>

        {/* Dashboard Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              {/* Analytics Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-secondary-text mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Account Rating
                    </span>
                    <Star
                      size={18}
                      className="fill-amber-400 stroke-amber-400"
                    />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-primary-text">
                      {user.rating}
                    </span>
                    <span className="text-xs text-secondary-text">/ 5.0</span>
                  </div>
                  <p className="text-[10px] text-brand-success font-bold mt-2">
                    ✓ Verified Profile Status
                  </p>
                </div>

                <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-secondary-text mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {user.isDriver ? "Active Offered Rides" : "Booked Rides"}
                    </span>
                    <Compass size={18} className="text-primary-blue" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-primary-text">
                      {user.isDriver
                        ? driverActiveRides.length
                        : bookings.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">
                    All routes active
                  </p>
                </div>

                <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-secondary-text mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {user.isDriver ? "Wallet Balance" : "Total Trips Shared"}
                    </span>
                    <CreditCard size={18} className="text-brand-success" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-primary-text">
                      {user.isDriver
                        ? `₹${totalEarnings || 450}`
                        : `${bookings.length}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">
                    {user.isDriver
                      ? "Direct deposit active"
                      : "Saved ₹1,200 on fuel"}
                  </p>
                </div>
              </div>

              {user.isDriver ? (
                // DRIVER DASHBOARD OVERVIEW PANELS
                <div className="space-y-6">
                  {/* Quick Actions Card */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-white">
                        Have an upcoming intercity trip?
                      </h4>
                      <p className="text-xs text-slate-400">
                        Offer your empty vehicle seats to passengers traveling
                        on the same route.
                      </p>
                    </div>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate("offer-ride")}
                        className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-50 text-xs font-extrabold rounded-2xl shadow-md transition-all shrink-0 text-center"
                      >
                        Offer a Ride 🚗
                      </button>
                    )}
                  </div>

                  {/* Driver Details Card (Verification & Vehicle Info) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Verification Status */}
                    <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-3 text-left">
                      <h4 className="text-sm font-bold text-primary-text flex items-center gap-1.5">
                        <ShieldCheck
                          size={18}
                          className="text-primary-blue fill-blue-50/20"
                        />{" "}
                        Driver Verification Status
                      </h4>
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">
                            Status: Verified Driver ✅
                          </p>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">
                            Verification badge active. Safe driving!
                          </p>
                        </div>
                        <span className="text-[10px] bg-primary-blue text-white px-2 py-0.5 rounded-md font-bold uppercase">
                          Active
                        </span>
                      </div>
                      <div className="text-[10px] text-secondary-text space-y-1">
                        <p>• Profile Selfie: verified</p>
                        <p>• Driving License: verified</p>
                        <p>• Mobile Number OTP: verified</p>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-3 text-left">
                      <h4 className="text-sm font-bold text-primary-text flex items-center gap-1.5">
                        <Car size={18} className="text-primary-blue" />{" "}
                        Registered Vehicle Information
                      </h4>
                      <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-1.5">
                        <p className="font-bold text-slate-800">
                          {user.vehicleDetails?.model || "Tesla Model 3"} (
                          {user.vehicleDetails?.color || "Midnight Blue"})
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-450 font-semibold">
                          <span>
                            Registration:{" "}
                            {user.vehicleDetails?.plateNumber ||
                              "KL-07-CD-1234"}
                          </span>
                          <span>•</span>
                          <span>
                            Seats: {user.vehicleDetails?.seats || 4} seats
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSubTab("settings")}
                        className="text-xs font-bold text-primary-blue hover:underline block text-left"
                      >
                        Edit Vehicle Settings
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-primary-text">
                        Passenger Booking Requests
                      </h3>
                      <p className="text-xs text-secondary-text">
                        Approve or decline requests for your upcoming trips.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {bookings.filter((b) => b.status === "pending").length ===
                      0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-brand-border">
                          <Users
                            size={32}
                            className="text-slate-400 mx-auto mb-2"
                          />
                          <p className="text-sm font-semibold text-secondary-text">
                            No pending passenger requests
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            They'll show up here when passengers book.
                          </p>
                        </div>
                      ) : (
                        bookings
                          .filter((b) => b.status === "pending")
                          .map((booking) => {
                            const fallbackPhoto =
                              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80";
                            const rideOrigin = booking.ride
                              ? booking.ride.origin
                              : booking.pickupPoint || "Kochi";
                            const rideDest = booking.ride
                              ? booking.ride.destination
                              : "Calicut";
                            const rideDate = booking.ride
                              ? booking.ride.date
                              : "Today";
                            const rideTime = booking.ride
                              ? booking.ride.time
                              : "08:00 AM";

                            return (
                              <div
                                key={booking.id}
                                className="p-5 bg-slate-50 border border-brand-border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all"
                              >
                                {/* Left Side: Passenger Info & Route Details */}
                                <div className="flex items-start gap-4">
                                  <img
                                    src={
                                      booking.passengerPhoto || fallbackPhoto
                                    }
                                    alt={booking.passengerName}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-blue/10 shrink-0"
                                  />

                                  <div className="space-y-1.5 text-left">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-bold text-primary-text">
                                        {booking.passengerName}
                                      </span>
                                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-md">
                                        ★ 4.8
                                      </span>
                                    </div>

                                    <div className="text-xs text-slate-650 font-semibold space-y-0.5">
                                      <p className="text-slate-800 font-bold">
                                        Pickup:{" "}
                                        <span className="text-primary-blue font-extrabold">
                                          {booking.pickupPoint || rideOrigin}
                                        </span>{" "}
                                        ➔ {rideDest}
                                      </p>
                                      <p className="text-[10px] text-slate-450">
                                        Schedule: {rideDate} at {rideTime}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                      <span>
                                        Seats: {booking.seatsBooked}{" "}
                                        {booking.seatsBooked === 1
                                          ? "Seat"
                                          : "Seats"}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        Total:{" "}
                                        <span className="text-primary-blue font-extrabold">
                                          ₹{booking.price}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side: Action Buttons */}
                                <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50">
                                  <button
                                    onClick={() =>
                                      handleBookingAction(
                                        booking.id,
                                        "accepted",
                                      )
                                    }
                                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-success hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                                  >
                                    <Check size={14} /> Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleBookingAction(
                                        booking.id,
                                        "rejected",
                                      )
                                    }
                                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
                                  >
                                    <X size={14} /> Decline
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // PASSENGER DASHBOARD
                <div className="space-y-6">
                  {/* Search Available Rides Card */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6 text-left">
                    <div>
                      <h3 className="text-lg font-bold text-primary-text">
                        Search Available Rides
                      </h3>
                      <p className="text-xs text-secondary-text">
                        Filter through verified commutes driving to your destination.
                      </p>
                    </div>

                    <form
                      onSubmit={handleApplyFilters}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
                    >
                      <div>
                        <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                          Leaving from
                        </label>
                        <input
                          type="text"
                          value={searchFrom}
                          onChange={(e) => setSearchFrom(e.target.value)}
                          placeholder="e.g. Kochi"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                          Going to
                        </label>
                        <input
                          type="text"
                          value={searchTo}
                          onChange={(e) => setSearchTo(e.target.value)}
                          placeholder="e.g. Kannur"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                          Departure Date
                        </label>
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

                    {/* Rides listing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border">
                      {rides.length === 0 ? (
                        <div className="col-span-full text-center py-10 bg-slate-50 border border-brand-border rounded-2xl border-dashed">
                          <Info size={32} className="text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-secondary-text">
                            No matching rides found
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Adjust filters or reset search to see all active commutes.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchFrom("");
                              setSearchTo("");
                              setSearchDate("");
                              refreshData();
                            }}
                            className="text-xs font-bold text-primary-blue hover:underline mt-2"
                          >
                            Reset Search
                          </button>
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
                              bookingStatus={bookingStatusMap[ride.id] || "none"}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Live Progress Card */}
                  <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-primary-text">
                          Live Ride Progress
                        </h3>
                        <p className="text-xs text-secondary-text">
                          Live tracking details for your current active trip.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsSosOpen(true)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-red-500/20"
                      >
                        <ShieldAlert size={14} className="animate-pulse" /> SOS
                        Emergency
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between text-white text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-primary-blue" />{" "}
                          Kochi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-brand-success" />{" "}
                          Kannur
                        </span>
                      </div>
                      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${gpsProgress * 100}%` }}
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary-blue to-brand-success"
                        />
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-semibold">
                            Estimated Arrival
                          </p>
                          <p className="text-sm font-bold text-white">
                            {gpsProgress >= 1.0
                              ? "Arrived safely ✅"
                              : "12:30 PM (2h remaining)"}
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
                            onClick={() =>
                              setGpsProgress((prev) => {
                                const nextVal = Math.min(
                                  1.0,
                                  parseFloat((prev + 0.2).toFixed(1)),
                                );
                                if (nextVal >= 1.0 && !safeArrivalConfirmed) {
                                  setShowSafeArrivalPopup(true);
                                }
                                return nextVal;
                              })
                            }
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
                        <h3 className="text-lg font-bold text-primary-text">
                          My Ride Requests
                        </h3>
                        <p className="text-xs text-secondary-text">
                          Track requests you posted for routes where no rides
                          were available.
                        </p>
                      </div>
                    </div>

                    {passengerRequests.filter((r) => r.passengerId === user.id)
                      .length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-brand-border">
                        <Users
                          size={32}
                          className="text-slate-400 mx-auto mb-2"
                        />
                        <p className="text-sm font-semibold text-secondary-text">
                          No active ride requests
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Post a request on the home or search page if you can't
                          find a driver.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {passengerRequests
                          .filter((r) => r.passengerId === user.id)
                          .map((req) => {
                            const statusColors = {
                              searching:
                                "bg-blue-50 text-primary-blue border-blue-100",
                              offer_received:
                                "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
                              confirmed:
                                "bg-emerald-50 text-brand-success border-emerald-200",
                              completed:
                                "bg-slate-100 text-slate-500 border-slate-200",
                              expired: "bg-red-50 text-red-600 border-red-200",
                            };
                            const statusLabels = {
                              searching: "Searching for Driver",
                              offer_received: "Offer Received ⚡",
                              confirmed: "Ride Confirmed",
                              completed: "Trip Completed",
                              expired: "Expired",
                            };

                            let activeStepIdx = 0;
                            if (req.status === "offer_received")
                              activeStepIdx = 1;
                            if (req.status === "confirmed") activeStepIdx = 2;
                            if (req.status === "completed") activeStepIdx = 3;

                            const steps = [
                              "Searching",
                              "Offer Received",
                              "Confirmed",
                              "Completed",
                            ];

                            return (
                              <div
                                key={req.id}
                                className="p-5 bg-slate-50 border border-brand-border rounded-2xl space-y-4"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-bold text-slate-800">
                                        {req.origin} → {req.destination}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 text-[9px] font-bold border rounded-md uppercase ${statusColors[req.status] || "bg-slate-100"}`}
                                      >
                                        {statusLabels[req.status] || req.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-secondary-text mt-0.5">
                                      Date: {req.date} at {req.time} •{" "}
                                      {req.seatsNeeded}{" "}
                                      {req.seatsNeeded === 1 ? "Seat" : "Seats"}{" "}
                                      • Max Contribution: ₹{req.maxPrice}
                                    </p>
                                  </div>
                                  {req.status === "expired" && (
                                    <button
                                      onClick={() => handleOneTapRepost(req.id)}
                                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all"
                                    >
                                      Repost with One Tap 🔄
                                    </button>
                                  )}
                                </div>

                                {/* Progress bar timeline */}
                                {req.status !== "expired" && (
                                  <div className="relative flex items-center justify-between pt-1 pb-2">
                                    <div className="absolute left-2 right-2 top-3 h-0.5 bg-slate-200 z-0" />
                                    <div
                                      className="absolute left-2 top-3 h-0.5 bg-primary-blue transition-all duration-305 z-0"
                                      style={{
                                        width: `${(activeStepIdx / (steps.length - 1)) * 96}%`,
                                      }}
                                    />

                                    {steps.map((step, idx) => {
                                      const isDone = idx < activeStepIdx;
                                      const isActive = idx === activeStepIdx;
                                      return (
                                        <div
                                          key={idx}
                                          className="flex flex-col items-center relative z-10"
                                        >
                                          <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                                              isDone
                                                ? "bg-brand-success text-white border-brand-success"
                                                : isActive
                                                  ? "bg-primary-blue text-white border-primary-blue ring-4 ring-blue-100"
                                                  : "bg-white text-slate-400 border-slate-200"
                                            }`}
                                          >
                                            {isDone ? "✓" : idx + 1}
                                          </div>
                                          <span
                                            className={`text-[8px] font-bold mt-1 ${isActive ? "text-primary-blue" : "text-slate-400"}`}
                                          >
                                            {step}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Offered Ride Details */}
                                {req.status === "offer_received" &&
                                  req.offeredRide && (
                                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={
                                              req.offeredRide.driverPhoto ||
                                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"
                                            }
                                            alt={req.offeredRide.driverName}
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                          <div>
                                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                              {req.offeredRide.driverName}
                                              <ShieldCheck
                                                size={12}
                                                className="fill-blue-500 text-white"
                                              />
                                            </p>
                                            <span className="text-[9px] text-slate-400 font-semibold">
                                              {req.offeredRide.vehicle} •{" "}
                                              {req.offeredRide.driverRating} ★
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-extrabold text-amber-700">
                                            ₹
                                            {req.offeredRide.contributionAmount}{" "}
                                            / Seat
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            handleAcceptDriverOffer(req.id)
                                          }
                                          className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all"
                                        >
                                          Accept Offer & Book Seat
                                        </button>
                                        <button
                                          onClick={() =>
                                            triggerMockNotification(
                                              "Offer dismissed.",
                                            )
                                          }
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
                          <h4 className="text-sm font-bold text-primary-text">
                            Saved Trusted Contact
                          </h4>
                          <p className="text-[10px] text-secondary-text">
                            Family or friends notified during active journeys
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTrustedContactFormOpen(true)}
                        className="text-xs font-bold text-primary-blue hover:underline"
                      >
                        {user.trustedContact ? "Edit Contact" : "Add Contact"}
                      </button>
                    </div>

                    {user.trustedContact ? (
                      <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.trustedContact.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {user.trustedContact.relationship} •{" "}
                            {user.trustedContact.phone}
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-brand-success px-2 py-0.5 rounded border border-emerald-100 font-bold">
                          Active Security Guard
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed text-xs text-secondary-text">
                        <p>No trusted contact added yet.</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Add a loved one so they can track your trip and verify
                          your safety.
                        </p>
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
                      <h4 className="text-base font-bold text-primary-text">
                        Trip Timeline
                      </h4>
                      <p className="text-xs text-secondary-text">
                        Current status of your booking and journey.
                      </p>
                    </div>

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 pt-2">
                      <div className="absolute top-[22px] left-6 right-6 h-0.5 bg-slate-200 hidden md:block" />
                      <div
                        className="absolute top-[22px] left-6 h-0.5 bg-brand-success transition-all duration-500 hidden md:block"
                        style={{
                          width: `${Math.min((currentTimelineIndex / (visualTimelineSteps.length - 1)) * 94, 94)}%`,
                        }}
                      />

                      {visualTimelineSteps.map((step, idx) => {
                        const isDone = idx < currentTimelineIndex;
                        const isActive = idx === currentTimelineIndex;
                        return (
                          <div
                            key={idx}
                            className="flex md:flex-col items-center md:text-center relative z-10 flex-1 gap-3 md:gap-0"
                          >
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-white ${
                                isDone
                                  ? "bg-brand-success text-white"
                                  : isActive
                                    ? "bg-primary-blue text-white ring-blue-100 animate-pulse"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {isDone ? "✓" : idx + 1}
                            </div>
                            <div className="md:mt-3.5 text-left md:text-center space-y-0.5">
                              <p
                                className={`text-xs font-bold ${isActive ? "text-primary-blue" : isDone ? "text-slate-800" : "text-slate-400"}`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[9px] text-slate-400 font-semibold">
                                {step.desc}
                              </p>
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



          {/* TAB: TRUSTED CONTACTS */}
          {activeSubTab === "trustedContacts" && !user.isDriver && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">
                    Emergency Safety Contacts
                  </h3>
                  <p className="text-xs text-secondary-text">
                    Configure trusted contacts who will receive emergency alerts
                    and real-time tracking details.
                  </p>
                </div>

                {user.trustedContact ? (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <div className="p-2.5 bg-primary-blue text-white rounded-xl shadow-md shadow-primary-blue/10 shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">
                        {user.trustedContact.name} (
                        {user.trustedContact.relationship})
                      </p>
                      <p className="text-xs text-slate-550 font-semibold">
                        {user.trustedContact.phone}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-primary-blue text-white px-2 py-0.5 rounded-md font-bold uppercase mt-1">
                        Active Safety Guard
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-bold text-amber-800">
                      No Trusted Contact configured
                    </p>
                    <p className="text-[10px] text-amber-600 font-semibold">
                      Please add a contact below to ensure automatic SOS
                      notifications during trips.
                    </p>
                  </div>
                )}

                <div className="border-t border-brand-border pt-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">
                    Update Trusted Contact
                  </h4>
                  <form onSubmit={handleSaveContact} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mary Prasad"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                            Relationship
                          </label>
                          <select
                            value={contactRelation}
                            onChange={(e) => setContactRelation(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                          >
                            {[
                              "Mother",
                              "Father",
                              "Brother",
                              "Sister",
                              "Husband",
                              "Wife",
                              "Friend",
                            ].map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 00123"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary-blue/15 transition-all"
                    >
                      Save Safety Contact Details
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TRIPS */}
          {activeSubTab === "trips" && (
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary-text">
                  My Travel Bookings
                </h3>
                <p className="text-xs text-secondary-text">
                  Track and manage details of your upcoming and past rides.
                </p>
              </div>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-sm text-secondary-text text-center py-6">
                    You haven't booked any rides yet.
                  </p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-slate-50 border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            {booking.ride
                              ? `${booking.ride.origin} → ${booking.ride.destination}`
                              : "Kochi → Kannur"}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${booking.status === "accepted" ? "bg-emerald-50 text-brand-success" : booking.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-secondary-text">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />{" "}
                            {booking.ride ? booking.ride.date : "Today"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} />{" "}
                            {booking.ride ? booking.ride.time : "08:00 AM"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                        <span className="text-lg font-extrabold text-slate-800">
                          ₹{booking.price}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}



          {/* TAB 5: SETTINGS */}
          {activeSubTab === "settings" && (
            <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary-text">
                  Profile Settings
                </h3>
                <p className="text-xs text-secondary-text">
                  Edit your details and toggle verification badges.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-brand-border rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider mb-1">
                      Government ID Verification
                    </h4>
                    <p className="text-xs text-secondary-text">
                      Provide an ID card to unlock the "Verified User" status.
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-brand-success text-xs font-bold border border-emerald-100 rounded-xl flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified Profile
                  </span>
                </div>
                {user.isDriver && (
                  <div className="p-4 border border-brand-border rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-primary-text uppercase tracking-wider">
                      Vehicle Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-secondary-text font-semibold mb-1">
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          value={user.vehicleDetails?.model || "Tesla Model 3"}
                          disabled
                          className="w-full px-3.5 py-2 bg-slate-50 border border-brand-border rounded-xl text-xs text-slate-600 cursor-not-allowed font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-secondary-text font-semibold mb-1">
                          License Plate
                        </label>
                        <input
                          type="text"
                          value={
                            user.vehicleDetails?.plateNumber || "KL-07-CD-1234"
                          }
                          disabled
                          className="w-full px-3.5 py-2 bg-slate-50 border border-brand-border rounded-xl text-xs text-slate-600 cursor-not-allowed font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-brand-border">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
                    Database Administration
                  </h4>
                  <p className="text-xs text-secondary-text mb-3">
                    Reset local database tables and purge all user configurations.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete all local user records and reset the database mock cache?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-xs font-extrabold rounded-xl transition-all"
                  >
                    🗑️ Delete All Users & Clear Database Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SOS DRAWER */}
      <SosDrawer
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        trustedContact={user.trustedContact}
      />

      {/* SHARE TRIP MODAL */}
      <AnimatePresence>
        {isShareTripOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-sm w-full relative overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <span className="text-xs font-bold flex items-center gap-1">
                  <Share2 size={13} className="text-primary-blue" /> Share Trip
                  Details
                </span>
                <button
                  onClick={() => setIsShareTripOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-secondary-text leading-relaxed">
                  We prepared a secure tracking link. You can send it directly
                  to your trusted contact so they can track your ride in
                  real-time.
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-800 shadow-sm space-y-2">
                  <p className="font-bold text-emerald-800 border-b border-emerald-100/50 pb-1">
                    🟢 Message Preview to {user?.trustedContact?.name || "Mom"}:
                  </p>
                  <p>
                    "{user.name} has started a RideLink trip from{" "}
                    <strong>Kochi to Kannur</strong>.
                  </p>
                  <p className="pl-2 border-l-2 border-emerald-400 text-slate-600 bg-emerald-100/30 py-1 rounded">
                    🚗 Driver: {mockDriverName} (Verified Driver ✅)
                    <br />
                    🚘 Vehicle: {mockDriverVehicle} ({mockDriverReg})<br />⏰
                    ETA: 12:30 PM
                  </p>
                  <p className="text-primary-blue underline font-bold mt-1.5 break-all">
                    http://localhost:3000/?track=ride_1
                  </p>
                </div>
                {user.trustedContact ? (
                  <button
                    onClick={() => {
                      setIsShareTripOpen(false);
                      triggerMockNotification(
                        `Trip details shared with ${user.trustedContact?.name}!`,
                      );
                    }}
                    className="w-full py-3 bg-brand-success hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    Send to {user.trustedContact.name} (
                    {user.trustedContact.relationship})
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-center text-amber-600 font-bold">
                      ⚠️ No saved trusted contact found
                    </p>
                    <button
                      onClick={() => {
                        setIsShareTripOpen(false);
                        setTrustedContactFormOpen(true);
                      }}
                      className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
                    >
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
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-sm w-full relative overflow-hidden"
            >
              <div className="p-6 pb-0 flex justify-between items-center">
                <h3 className="text-base font-extrabold text-primary-text">
                  Configure Trusted Contact
                </h3>
                <button
                  onClick={() => setTrustedContactFormOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveContact} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mary Prasad"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                      Relationship
                    </label>
                    <select
                      value={contactRelation}
                      onChange={(e) => setContactRelation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    >
                      {[
                        "Mother",
                        "Father",
                        "Brother",
                        "Sister",
                        "Husband",
                        "Wife",
                        "Friend",
                      ].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 00123"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl shadow-md"
                >
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
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-brand-border p-6 shadow-2xl max-w-sm w-full text-center space-y-5"
            >
              <div className="w-14 h-14 bg-emerald-50 text-brand-success rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <Check size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-primary-text">
                  Have you reached safely?
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Your driver has reached the final destination. Please confirm
                  your safe arrival.
                </p>
              </div>
              {user.trustedContact && (
                <div className="bg-slate-50 border rounded-xl p-3 text-[9px] text-slate-500 text-left font-medium">
                  <strong>SMS Sent to {user.trustedContact.name}:</strong>
                  <br />
                  "Good news! {user.name} has safely reached Kannur. Thank you
                  for using RideLink."
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSafeArrivalYes}
                  className="flex-1 py-3 bg-brand-success hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-all"
                >
                  ✅ Yes, I'm Safe
                </button>
                <button
                  onClick={() => {
                    setShowSafeArrivalPopup(false);
                    setIsSosOpen(true);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all"
                >
                  ⚠️ I Need Help
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {selectedRideForBooking && (
          <BookingRequestModal
            ride={selectedRideForBooking}
            onClose={() => setSelectedRideForBooking(null)}
            onSubmitBooking={handleBookingSubmission}
            onNavigateToDashboard={() => {
              setSelectedRideForBooking(null);
              setActiveSubTab("trips");
            }}
          />
        )}
      </AnimatePresence>

      {/* Driver Verification Prompt Modal */}
      <AnimatePresence>
        {showDriverVerificationPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-brand-border p-6 shadow-2xl max-w-md w-full text-left space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 text-primary-blue rounded-xl flex items-center justify-center shadow-sm">
                  <ShieldCheck size={26} className="stroke-[2]" />
                </div>
                <button
                  onClick={() => setShowDriverVerificationPrompt(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-650 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-primary-text">
                  Driver Verification Required
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Before you can switch to Driver Mode and offer empty seats in
                  your car, we need to verify your driving credentials for
                  platform safety.
                </p>
              </div>

              <div className="bg-slate-50 border border-brand-border rounded-2xl p-4 space-y-2.5 text-xs text-secondary-text">
                <p className="font-bold text-primary-text text-[11px] uppercase tracking-wider mb-0.5">
                  Verification Checklist:
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
                  <span>Profile Selfie verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
                  <span>Valid Government Driving License</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
                  <span>Vehicle Specifications & Registration Plate</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowDriverVerificationPrompt(false);
                    if (onStartDriverVerification) {
                      onStartDriverVerification();
                    } else if (onNavigate) {
                      onNavigate("offer-ride");
                    }
                  }}
                  className="w-full py-3 bg-primary-blue text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary-blue/15 hover:bg-dark-blue transition-all text-center"
                >
                  Start Driver Verification Wizard
                </button>
                <button
                  onClick={() => setShowDriverVerificationPrompt(false)}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
