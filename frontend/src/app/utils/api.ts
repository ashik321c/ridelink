// Client-side API caller with automated backend connection and local fallback.
// If the backend server at port 5001 is unavailable, it automatically falls back
// to mock storage in localStorage so the application works perfectly in all conditions.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// In-Memory fallback store for browser session if backend is down
const clientFallbackDb = {
  getUsers: () => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem('rl_users');
    if (!val) {
      const defaultUsers = [
        {
          id: "user_1",
          name: "Alex Johnson",
          email: "alex@ridelink.com",
          phone: "+1 555-0199",
          profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
          rating: 4.9,
          reviewsCount: 38,
          isDriver: true,
          verificationStatus: "verified",
          governmentIdVerified: true,
          vehicleDetails: { model: "Tesla Model 3", color: "Deep Blue", plateNumber: "CA 7XYZ89", seats: 4 },
          bio: "Tech worker commuting daily between Kochi and Kannur. Quiet driver, loves podcasts."
        },
        {
          id: "user_2",
          name: "Sarah Miller",
          email: "sarah@ridelink.com",
          phone: "+1 555-0144",
          profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
          rating: 4.8,
          reviewsCount: 12,
          isDriver: false,
          verificationStatus: "verified",
          governmentIdVerified: true,
          bio: "UI/UX Designer who travels frequently. Friendly and loves meeting new people!"
        },
        {
          id: "user_3",
          name: "Michael Chen",
          email: "michael@ridelink.com",
          phone: "+1 555-0155",
          profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
          rating: 4.7,
          reviewsCount: 22,
          isDriver: true,
          verificationStatus: "verified",
          governmentIdVerified: true,
          vehicleDetails: { model: "Honda Civic", color: "Sleek Silver", plateNumber: "CA 3ABC12", seats: 3 },
          bio: "Frequent traveler. I drive safe and keep my car super clean. Music preferences: Indie Rock."
        }
      ];
      localStorage.setItem('rl_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(val);
  },
  
  getRides: () => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem('rl_rides');
    if (!val) {
      const defaultRides = [
        {
          id: "ride_1",
          driverId: "user_1",
          driverName: "Alex Johnson",
          driverPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
          driverRating: 4.9,
          origin: "Kochi",
          destination: "Kannur",
          date: new Date().toISOString().split('T')[0], // today
          time: "08:00",
          seatsAvailable: 3,
          totalSeats: 4,
          contributionAmount: 450,
          vehicle: "Tesla Model 3 (Blue)",
          womenOnly: false,
          status: "active",
          passengers: []
        },
        {
          id: "ride_2",
          driverId: "user_3",
          driverName: "Michael Chen",
          driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
          driverRating: 4.7,
          origin: "Kochi",
          destination: "Trivandrum",
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          time: "06:30",
          seatsAvailable: 2,
          totalSeats: 3,
          contributionAmount: 600,
          vehicle: "Honda Civic (Silver)",
          womenOnly: false,
          status: "active",
          passengers: []
        },
        {
          id: "ride_3",
          driverId: "user_1",
          driverName: "Alex Johnson",
          driverPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
          driverRating: 4.9,
          origin: "Bangalore",
          destination: "Chennai",
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // day after tomorrow
          time: "14:00",
          seatsAvailable: 4,
          totalSeats: 4,
          contributionAmount: 750,
          vehicle: "Tesla Model 3 (Blue)",
          womenOnly: true,
          status: "active",
          passengers: []
        }
      ];
      localStorage.setItem('rl_rides', JSON.stringify(defaultRides));
      return defaultRides;
    }
    return JSON.parse(val);
  },

  getBookings: () => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem('rl_bookings');
    if (!val) {
      const defaultBookings = [
        {
          id: "booking_1",
          rideId: "ride_1",
          passengerId: "user_2",
          passengerName: "Sarah Miller",
          seatsBooked: 1,
          status: "accepted",
          paymentStatus: "paid",
          price: 450,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('rl_bookings', JSON.stringify(defaultBookings));
      return defaultBookings;
    }
    return JSON.parse(val);
  },

  getMessages: () => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem('rl_messages');
    if (!val) {
      const defaultMessages = [
        {
          id: "msg_1",
          rideId: "ride_1",
          senderId: "user_2",
          senderName: "Sarah Miller",
          text: "Hi Alex! Where should we meet in Kochi for the pickup?",
          timestamp: "2026-06-25T14:30:00Z"
        },
        {
          id: "msg_2",
          rideId: "ride_1",
          senderId: "user_1",
          senderName: "Alex Johnson",
          text: "Hey Sarah! Let's meet near the Lulu Mall main entrance. Does 8 AM work?",
          timestamp: "2026-06-25T14:32:00Z"
        }
      ];
      localStorage.setItem('rl_messages', JSON.stringify(defaultMessages));
      return defaultMessages;
    }
    return JSON.parse(val);
  },

  getPassengerRequests: () => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem('rl_passenger_requests');
    if (!val) {
      const defaultRequests = [
        {
          id: "pr_1",
          passengerId: "user_2",
          passengerName: "Sarah Miller",
          passengerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
          passengerRating: 4.8,
          isVerified: true,
          origin: "Kochi",
          destination: "Kannur",
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          time: "09:00",
          flexibleTime: "±1 hour",
          seatsNeeded: 2,
          maxPrice: 500,
          note: "Traveling for a family weekend. I have one small travel suitcase.",
          status: "searching",
          createdAt: new Date().toISOString()
        },
        {
          id: "pr_2",
          passengerId: "user_2",
          passengerName: "Sarah Miller",
          passengerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
          passengerRating: 4.8,
          isVerified: true,
          origin: "Kochi",
          destination: "Calicut",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: "08:00",
          flexibleTime: "±30 min",
          seatsNeeded: 1,
          maxPrice: 400,
          note: "Looking for an early ride.",
          status: "expired",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
      localStorage.setItem('rl_passenger_requests', JSON.stringify(defaultRequests));
      return defaultRequests;
    }
    return JSON.parse(val);
  },

  saveData: (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
};

// Helper for making API calls with fallback
async function fetchApi(path: string, options: RequestInit = {}) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rl_token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn(`Backend connection failed for path: ${path}. Using client local storage fallback.`);
    return handleFallback(path, options);
  }
}

// Client fallback resolver
function handleFallback(path: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('rl_token') : null;
  let userId = 'user_2'; // default to passenger Sarah Miller
  if (token && token.startsWith('mock_jwt_token_')) {
    userId = token.replace('mock_jwt_token_', '');
  }

  // 1. Auth Endpoint
  if (path === '/auth/login' && method === 'POST') {
    const { email, phone, name, isDriver } = body;
    const users = clientFallbackDb.getUsers();
    let user = users.find((u: any) => u.email === email || u.phone === phone);
    
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        name: name || (email ? email.split('@')[0] : "New User"),
        email: email || `${phone}@ridelink.com`,
        phone: phone || "+1 555-0100",
        profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80",
        rating: 5.0,
        reviewsCount: 0,
        isDriver: !!isDriver,
        verificationStatus: "pending",
        governmentIdVerified: false,
        vehicleDetails: isDriver ? { model: "Tesla Model Y", color: "White", plateNumber: "CA 8NEW12", seats: 4 } : null,
        bio: "Just joined RideLink!"
      };
      users.push(user);
      clientFallbackDb.saveData('rl_users', users);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('rl_token', `mock_jwt_token_${user.id}`);
      localStorage.setItem('rl_user', JSON.stringify(user));
    }
    return { success: true, user, token: `mock_jwt_token_${user.id}` };
  }

  if (path === '/auth/me' && method === 'GET') {
    const users = clientFallbackDb.getUsers();
    const user = users.find((u: any) => u.id === userId) || users[0];
    return { success: true, user };
  }

  if (path === '/auth/profile' && method === 'PUT') {
    const users = clientFallbackDb.getUsers();
    const userIdx = users.findIndex((u: any) => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], ...body };
      clientFallbackDb.saveData('rl_users', users);
      if (typeof window !== 'undefined') {
        localStorage.setItem('rl_user', JSON.stringify(users[userIdx]));
      }
      return { success: true, user: users[userIdx] };
    }
    return { success: false, message: 'User not found' };
  }

  // 2. Ride Endpoints
  if (path.startsWith('/rides') && method === 'GET') {
    const rides = clientFallbackDb.getRides();
    
    // Ride Details
    const match = path.match(/\/rides\/([a-zA-Z0-9_]+)/);
    if (match) {
      const rideId = match[1];
      const ride = rides.find((r: any) => r.id === rideId);
      if (!ride) return { success: false, message: 'Ride not found' };
      const driver = clientFallbackDb.getUsers().find((u: any) => u.id === ride.driverId);
      return { success: true, ride, driver };
    }

    // Ride search (filtering is handled in the components)
    return { success: true, rides };
  }

  if (path === '/rides' && method === 'POST') {
    const rides = clientFallbackDb.getRides();
    const driver = clientFallbackDb.getUsers().find((u: any) => u.id === userId) || clientFallbackDb.getUsers()[0];
    
    const newRide = {
      id: `ride_${Date.now()}`,
      driverId: driver.id,
      driverName: driver.name,
      driverPhoto: driver.profilePicture,
      driverRating: driver.rating,
      origin: body.origin,
      destination: body.destination,
      date: body.date,
      time: body.time,
      seatsAvailable: parseInt(body.seatsAvailable),
      totalSeats: parseInt(body.seatsAvailable),
      contributionAmount: parseInt(body.contributionAmount),
      vehicle: body.vehicle || (driver.vehicleDetails ? `${driver.vehicleDetails.model} (${driver.vehicleDetails.color})` : "Standard Car"),
      womenOnly: !!body.womenOnly,
      status: 'active',
      passengers: []
    };

    rides.push(newRide);
    clientFallbackDb.saveData('rl_rides', rides);
    return { success: true, ride: newRide };
  }

  // 3. Booking Endpoints
  if (path === '/bookings' && method === 'POST') {
    const bookings = clientFallbackDb.getBookings();
    const rides = clientFallbackDb.getRides();
    const passenger = clientFallbackDb.getUsers().find((u: any) => u.id === userId) || clientFallbackDb.getUsers()[1];
    
    const ride = rides.find((r: any) => r.id === body.rideId);
    if (!ride) return { success: false, message: 'Ride not found' };

    const newBooking = {
      id: `booking_${Date.now()}`,
      rideId: body.rideId,
      passengerId: passenger.id,
      passengerName: passenger.name,
      seatsBooked: parseInt(body.seatsBooked),
      status: 'pending',
      paymentStatus: 'pending',
      price: ride.contributionAmount * parseInt(body.seatsBooked),
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    clientFallbackDb.saveData('rl_bookings', bookings);
    return { success: true, booking: newBooking };
  }

  if (path === '/bookings' && method === 'GET') {
    const bookings = clientFallbackDb.getBookings();
    const rides = clientFallbackDb.getRides();
    const user = clientFallbackDb.getUsers().find((u: any) => u.id === userId);

    let userBookings = [];
    if (user && user.isDriver) {
      const driverRideIds = rides.filter((r: any) => r.driverId === userId).map((r: any) => r.id);
      userBookings = bookings.filter((b: any) => driverRideIds.includes(b.rideId));
    } else {
      userBookings = bookings.filter((b: any) => b.passengerId === userId);
    }

    const bookingsWithRides = userBookings.map((booking: any) => {
      const ride = rides.find((r: any) => r.id === booking.rideId);
      return { ...booking, ride };
    });

    return { success: true, bookings: bookingsWithRides };
  }

  if (path.startsWith('/bookings/') && method === 'PUT') {
    const bookings = clientFallbackDb.getBookings();
    const rides = clientFallbackDb.getRides();
    
    const bookingId = path.split('/').pop();
    const bookingIdx = bookings.findIndex((b: any) => b.id === bookingId);
    
    if (bookingIdx === -1) return { success: false, message: 'Booking not found' };
    
    const booking = bookings[bookingIdx];
    const rideIdx = rides.findIndex((r: any) => r.id === booking.rideId);
    
    if (body.status) {
      booking.status = body.status;
      if (body.status === 'accepted' && rideIdx !== -1) {
        rides[rideIdx].seatsAvailable = Math.max(0, rides[rideIdx].seatsAvailable - booking.seatsBooked);
        rides[rideIdx].passengers.push(booking.passengerId);
      }
    }
    
    if (body.paymentStatus) {
      booking.paymentStatus = body.paymentStatus;
    }

    bookings[bookingIdx] = booking;
    clientFallbackDb.saveData('rl_bookings', bookings);
    clientFallbackDb.saveData('rl_rides', rides);
    
    return { success: true, booking, ride: rides[rideIdx] };
  }

  // 4. Chat Endpoints
  if (path.startsWith('/chats/') && method === 'GET') {
    const rideId = path.split('/').pop();
    const messages = clientFallbackDb.getMessages();
    return { success: true, messages: messages.filter((m: any) => m.rideId === rideId) };
  }

  if (path.startsWith('/chats/') && method === 'POST') {
    const rideId = path.split('/').pop();
    const messages = clientFallbackDb.getMessages();
    const user = clientFallbackDb.getUsers().find((u: any) => u.id === userId) || clientFallbackDb.getUsers()[1];
    
    const newMsg = {
      id: `msg_${Date.now()}`,
      rideId,
      senderId: user.id,
      senderName: user.name,
      text: body.text,
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMsg);
    clientFallbackDb.saveData('rl_messages', messages);
    return { success: true, message: newMsg };
  }

  // 5. Admin Endpoint
  if (path === '/admin/stats' && method === 'GET') {
    const rides = clientFallbackDb.getRides();
    const users = clientFallbackDb.getUsers();
    const bookings = clientFallbackDb.getBookings();
    
    return {
      success: true,
      stats: {
        totalRides: rides.length,
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalRevenue: bookings.filter((b: any) => b.paymentStatus === 'paid').reduce((sum: number, b: any) => sum + b.price, 0),
        activeDrivers: users.filter((u: any) => u.isDriver).length,
        verifiedUsers: users.filter((u: any) => u.verificationStatus === 'verified').length
      }
    };
  }

  // 6. Passenger Requests Endpoints
  if (path.startsWith('/passenger-requests') && method === 'GET') {
    const requests = clientFallbackDb.getPassengerRequests();
    const todayStr = new Date().toISOString().split('T')[0];

    // Expiry check
    requests.forEach((r: any) => {
      if (r.date < todayStr && r.status === 'searching') {
        r.status = 'expired';
      }
    });
    clientFallbackDb.saveData('rl_passenger_requests', requests);

    // Filter handling
    const urlParams = new URLSearchParams(path.split('?')[1] || '');
    const pId = urlParams.get('passengerId');
    const fromCity = urlParams.get('from');
    const toCity = urlParams.get('to');

    let filtered = [...requests];
    if (pId) filtered = filtered.filter((r: any) => r.passengerId === pId);
    if (fromCity) filtered = filtered.filter((r: any) => r.origin.toLowerCase().includes(fromCity.toLowerCase()));
    if (toCity) filtered = filtered.filter((r: any) => r.destination.toLowerCase().includes(toCity.toLowerCase()));

    return { success: true, requests: filtered };
  }

  if (path === '/passenger-requests' && method === 'POST') {
    const requests = clientFallbackDb.getPassengerRequests();
    const passenger = clientFallbackDb.getUsers().find((u: any) => u.id === userId) || clientFallbackDb.getUsers()[1];

    const newRequest = {
      id: `pr_${Date.now()}`,
      passengerId: passenger.id,
      passengerName: passenger.name,
      passengerPhoto: passenger.profilePicture,
      passengerRating: passenger.rating,
      isVerified: passenger.verificationStatus === 'verified' || passenger.governmentIdVerified,
      origin: body.origin,
      destination: body.destination,
      date: body.date,
      time: body.time,
      flexibleTime: body.flexibleTime || 'Any Time',
      seatsNeeded: parseInt(body.seatsNeeded) || 1,
      maxPrice: parseInt(body.maxPrice) || 300,
      note: body.note || '',
      status: 'searching',
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    clientFallbackDb.saveData('rl_passenger_requests', requests);
    return { success: true, request: newRequest };
  }

  if (path.startsWith('/passenger-requests/') && method === 'PUT') {
    const requests = clientFallbackDb.getPassengerRequests();
    const requestId = path.split('/').pop();
    const idx = requests.findIndex((r: any) => r.id === requestId);

    if (idx === -1) return { success: false, message: 'Request not found' };

    const req = requests[idx];
    const { action, offeredRideId, date, time } = body;

    if (action === 'send_offer') {
      req.status = 'offer_received';
      req.offeredRideId = offeredRideId;
      const ride = clientFallbackDb.getRides().find((r: any) => r.id === offeredRideId);
      if (ride) {
        req.offeredRide = ride;
      }
    } else if (action === 'accept_offer') {
      const rides = clientFallbackDb.getRides();
      const bookings = clientFallbackDb.getBookings();
      const rideIdx = rides.findIndex((r: any) => r.id === req.offeredRideId);

      if (rideIdx === -1) {
        return { success: false, message: 'Offered ride is no longer available' };
      }

      const ride = rides[rideIdx];
      const newBooking = {
        id: `booking_${Date.now()}`,
        rideId: ride.id,
        passengerId: req.passengerId,
        passengerName: req.passengerName,
        seatsBooked: req.seatsNeeded,
        status: 'accepted',
        paymentStatus: 'paid',
        price: ride.contributionAmount * req.seatsNeeded,
        createdAt: new Date().toISOString()
      };

      bookings.push(newBooking);
      ride.seatsAvailable = Math.max(0, ride.seatsAvailable - req.seatsNeeded);
      ride.passengers.push(req.passengerId);

      req.status = 'confirmed';
      req.bookingId = newBooking.id;

      clientFallbackDb.saveData('rl_bookings', bookings);
      clientFallbackDb.saveData('rl_rides', rides);
    } else if (action === 'repost') {
      req.status = 'searching';
      if (date) req.date = date;
      if (time) req.time = time;
    } else if (action === 'complete') {
      req.status = 'completed';
    } else if (action === 'cancel') {
      req.status = 'cancelled';
    }

    requests[idx] = req;
    clientFallbackDb.saveData('rl_passenger_requests', requests);
    return { success: true, request: req };
  }

  return { success: false, message: 'Endpoint fallback not implemented' };
}

// API Export Methods
export const api = {
  // Auth
  login: (data: { email?: string; phone?: string; name?: string; isDriver?: boolean }) => 
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  getMe: () => 
    fetchApi('/auth/me'),
    
  updateProfile: (data: any) => 
    fetchApi('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Rides
  searchRides: (filters: { from?: string; to?: string; date?: string; seats?: string; maxPrice?: string }) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchApi(`/rides?${query.toString()}`);
  },

  getRideDetails: (id: string) => 
    fetchApi(`/rides/${id}`),

  createRide: (data: {
    origin: string;
    destination: string;
    date: string;
    time: string;
    seatsAvailable: number;
    contributionAmount: number;
    vehicle?: string;
    womenOnly?: boolean;
  }) => fetchApi('/rides', { method: 'POST', body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data: { rideId: string; seatsBooked: number }) => 
    fetchApi('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getBookings: () => 
    fetchApi('/bookings'),

  updateBookingStatus: (id: string, data: { status?: string; paymentStatus?: string }) => 
    fetchApi(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Chat
  getMessages: (rideId: string) => 
    fetchApi(`/chats/${rideId}`),

  sendMessage: (rideId: string, text: string) => 
    fetchApi(`/chats/${rideId}`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Admin
  getAdminStats: () => 
    fetchApi('/admin/stats'),

  // Passenger Requests
  getPassengerRequests: (filters: { passengerId?: string; from?: string; to?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchApi(`/passenger-requests?${query.toString()}`);
  },

  createPassengerRequest: (data: {
    origin: string;
    destination: string;
    date: string;
    time: string;
    flexibleTime: string;
    seatsNeeded: number;
    maxPrice: number;
    note?: string;
  }) => fetchApi('/passenger-requests', { method: 'POST', body: JSON.stringify(data) }),

  updatePassengerRequest: (id: string, data: {
    action: 'send_offer' | 'accept_offer' | 'repost' | 'complete' | 'cancel';
    offeredRideId?: string;
    date?: string;
    time?: string;
  }) => fetchApi(`/passenger-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};
