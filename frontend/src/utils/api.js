// Client-side API caller with automated backend connection and local fallback.
// If the backend server at port 5001 is unavailable, it automatically falls back
// to mock storage in localStorage so the application works perfectly in all conditions.

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5001/api";

// In-Memory fallback store for browser session if backend is down
const clientFallbackDb = {
  getUsers: () => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem("rl_users");
    if (!val) {
      const defaultUsers = [];
      localStorage.setItem("rl_users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(val);
  },
  getRides: () => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem("rl_rides");
    if (!val) {
      const defaultRides = [];
      localStorage.setItem("rl_rides", JSON.stringify(defaultRides));
      return defaultRides;
    }
    return JSON.parse(val);
  },

  getBookings: () => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem("rl_bookings");
    if (!val) {
      const defaultBookings = [];
      localStorage.setItem("rl_bookings", JSON.stringify(defaultBookings));
      return defaultBookings;
    }
    return JSON.parse(val);
  },

  getMessages: () => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem("rl_messages");
    if (!val) {
      const defaultMessages = [];
      localStorage.setItem("rl_messages", JSON.stringify(defaultMessages));
      return defaultMessages;
    }
    return JSON.parse(val);
  },

  getPassengerRequests: () => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem("rl_passenger_requests");
    if (!val) {
      const defaultRequests = [];
      localStorage.setItem(
        "rl_passenger_requests",
        JSON.stringify(defaultRequests),
      );
      return defaultRequests;
    }
    return JSON.parse(val);
  },

  saveData: (key, data) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  },
};

// Helper for making API calls with fallback
async function fetchApi(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("rl_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    console.warn(
      `Backend server is offline for path: ${path}. Using client local storage fallback.`,
    );
    return handleFallback(path, options);
  }

  if (!response.ok) {
    try {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
        status: response.status,
      };
    } catch {
      return {
        success: false,
        error: `API error: ${response.status}`,
        status: response.status,
      };
    }
  }

  try {
    return await response.json();
  } catch {
    return { success: false, error: "Failed to parse API JSON response" };
  }
}

// Client fallback resolver
function handleFallback(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("rl_token") : null;
  let userId = null;
  if (token) {
    if (token.startsWith("mock_jwt_token_")) {
      userId = token.replace("mock_jwt_token_", "");
    } else {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id;
      } catch {
        userId = null;
      }
    }
  }

  // 1. Auth Endpoint
  if (path === "/auth/login" && method === "POST") {
    const { email, phone } = body;
    const users = clientFallbackDb.getUsers();
    let user = users.find((u) => u.email === email || u.phone === phone);
    if (!user) {
      return { success: false, error: "Account not found. Please sign up first." };
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("rl_token", `mock_jwt_token_${user.id}`);
      localStorage.setItem("rl_user", JSON.stringify(user));
    }
    return { success: true, user, token: `mock_jwt_token_${user.id}` };
  }

  if (path === "/auth/signup" && method === "POST") {
    const { email, phone, name, isDriver } = body;
    const users = clientFallbackDb.getUsers();
    let user = users.find((u) => u.email === email || u.phone === phone);
    if (user) {
      return { success: false, error: "An account with this email or phone number already exists." };
    }

    user = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      profilePicture:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80",
      rating: 5.0,
      reviewsCount: 0,
      isDriver: !!isDriver,
      verificationStatus: "pending",
      governmentIdVerified: false,
      vehicleDetails: isDriver
        ? {
            model: "Tesla Model Y",
            color: "White",
            plateNumber: "CA 8NEW12",
            seats: 4,
          }
        : null,
      bio: "Just joined RideLink!",
    };
    users.push(user);
    clientFallbackDb.saveData("rl_users", users);

    if (typeof window !== "undefined") {
      localStorage.setItem("rl_token", `mock_jwt_token_${user.id}`);
      localStorage.setItem("rl_user", JSON.stringify(user));
    }
    return { success: true, user, token: `mock_jwt_token_${user.id}` };
  }

  if (path === "/auth/me" && method === "GET") {
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    const users = clientFallbackDb.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: "User profile not found" };
    }
    return { success: true, user };
  }

  if (path === "/auth/profile" && method === "PUT") {
    const users = clientFallbackDb.getUsers();
    const userIdx = users.findIndex((u) => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], ...body };
      clientFallbackDb.saveData("rl_users", users);
      if (typeof window !== "undefined") {
        localStorage.setItem("rl_user", JSON.stringify(users[userIdx]));
      }
      return { success: true, user: users[userIdx] };
    }
    return { success: false, message: "User not found" };
  }

  // 2. Ride Endpoints
  if (path.startsWith("/rides") && method === "GET") {
    const rides = clientFallbackDb.getRides();
    // Ride Details
    const match = path.match(/\/rides\/([a-zA-Z0-9_]+)/);
    if (match) {
      const rideId = match[1];
      const ride = rides.find((r) => r.id === rideId);
      if (!ride) return { success: false, message: "Ride not found" };
      const driver = clientFallbackDb
        .getUsers()
        .find((u) => u.id === ride.driverId);
      return { success: true, ride, driver };
    }

    // Ride search (filtering is handled in the components)
    return { success: true, rides };
  }

  if (path === "/rides" && method === "POST") {
    const rides = clientFallbackDb.getRides();
    const driver =
      clientFallbackDb.getUsers().find((u) => u.id === userId) ||
      clientFallbackDb.getUsers()[0];
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
      vehicle:
        body.vehicle ||
        (driver.vehicleDetails
          ? `${driver.vehicleDetails.model} (${driver.vehicleDetails.color})`
          : "Standard Car"),
      womenOnly: !!body.womenOnly,
      status: "active",
      passengers: [],
    };

    rides.push(newRide);
    clientFallbackDb.saveData("rl_rides", rides);
    return { success: true, ride: newRide };
  }

  // 3. Booking Endpoints
  if (path === "/bookings" && method === "POST") {
    const bookings = clientFallbackDb.getBookings();
    const rides = clientFallbackDb.getRides();
    const passenger =
      clientFallbackDb.getUsers().find((u) => u.id === userId) ||
      clientFallbackDb.getUsers()[1];
    const ride = rides.find((r) => r.id === body.rideId);
    if (!ride) return { success: false, message: "Ride not found" };

    const newBooking = {
      id: `booking_${Date.now()}`,
      rideId: body.rideId,
      passengerId: passenger.id,
      passengerName: passenger.name,
      seatsBooked: parseInt(body.seatsBooked),
      status: "pending",
      paymentStatus: "pending",
      price: ride.contributionAmount * parseInt(body.seatsBooked),
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    clientFallbackDb.saveData("rl_bookings", bookings);
    return { success: true, booking: newBooking };
  }

  if (path === "/bookings" && method === "GET") {
    const bookings = clientFallbackDb.getBookings();
    const rides = clientFallbackDb.getRides();
    const user = clientFallbackDb.getUsers().find((u) => u.id === userId);

    let userBookings = [];
    if (user && user.isDriver) {
      const driverRideIds = rides
        .filter((r) => r.driverId === userId)
        .map((r) => r.id);
      userBookings = bookings.filter((b) => driverRideIds.includes(b.rideId));
    } else {
      userBookings = bookings.filter((b) => b.passengerId === userId);
    }

    const bookingsWithRides = userBookings.map((booking) => {
      const ride = rides.find((r) => r.id === booking.rideId);
      return { ...booking, ride };
    });

    return { success: true, bookings: bookingsWithRides };
  }

  if (path.startsWith("/bookings/") && method === "PUT") {
    const bookings = clientFallbackDb.getBookings();
    const rides = clientFallbackDb.getRides();
    const bookingId = path.split("/").pop();
    const bookingIdx = bookings.findIndex((b) => b.id === bookingId);
    if (bookingIdx === -1)
      return { success: false, message: "Booking not found" };
    const booking = bookings[bookingIdx];
    const rideIdx = rides.findIndex((r) => r.id === booking.rideId);
    if (body.status) {
      booking.status = body.status;
      if (body.status === "accepted" && rideIdx !== -1) {
        rides[rideIdx].seatsAvailable = Math.max(
          0,
          rides[rideIdx].seatsAvailable - booking.seatsBooked,
        );
        rides[rideIdx].passengers.push(booking.passengerId);
      }
    }
    if (body.paymentStatus) {
      booking.paymentStatus = body.paymentStatus;
    }

    bookings[bookingIdx] = booking;
    clientFallbackDb.saveData("rl_bookings", bookings);
    clientFallbackDb.saveData("rl_rides", rides);
    return { success: true, booking, ride: rides[rideIdx] };
  }

  // 4. Chat Endpoints
  if (path.startsWith("/chats/") && method === "GET") {
    const rideId = path.split("/").pop();
    const messages = clientFallbackDb.getMessages();
    return {
      success: true,
      messages: messages.filter((m) => m.rideId === rideId),
    };
  }

  if (path.startsWith("/chats/") && method === "POST") {
    const rideId = path.split("/").pop();
    const messages = clientFallbackDb.getMessages();
    const user =
      clientFallbackDb.getUsers().find((u) => u.id === userId) ||
      clientFallbackDb.getUsers()[1];
    const newMsg = {
      id: `msg_${Date.now()}`,
      rideId,
      senderId: user.id,
      senderName: user.name,
      text: body.text,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMsg);
    clientFallbackDb.saveData("rl_messages", messages);
    return { success: true, message: newMsg };
  }

  // 5. Admin Endpoint
  if (path === "/admin/stats" && method === "GET") {
    const rides = clientFallbackDb.getRides();
    const users = clientFallbackDb.getUsers();
    const bookings = clientFallbackDb.getBookings();
    return {
      success: true,
      stats: {
        totalRides: rides.length,
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalRevenue: bookings
          .filter((b) => b.paymentStatus === "paid")
          .reduce((sum, b) => sum + b.price, 0),
        activeDrivers: users.filter((u) => u.isDriver).length,
        verifiedUsers: users.filter((u) => u.verificationStatus === "verified")
          .length,
      },
    };
  }

  // 6. Passenger Requests Endpoints
  if (path.startsWith("/passenger-requests") && method === "GET") {
    const requests = clientFallbackDb.getPassengerRequests();
    const todayStr = new Date().toISOString().split("T")[0];

    // Expiry check
    requests.forEach((r) => {
      if (r.date < todayStr && r.status === "searching") {
        r.status = "expired";
      }
    });
    clientFallbackDb.saveData("rl_passenger_requests", requests);

    // Filter handling
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const pId = urlParams.get("passengerId");
    const fromCity = urlParams.get("from");
    const toCity = urlParams.get("to");

    let filtered = [...requests];
    if (pId) filtered = filtered.filter((r) => r.passengerId === pId);
    if (fromCity)
      filtered = filtered.filter((r) =>
        r.origin.toLowerCase().includes(fromCity.toLowerCase()),
      );
    if (toCity)
      filtered = filtered.filter((r) =>
        r.destination.toLowerCase().includes(toCity.toLowerCase()),
      );

    return { success: true, requests: filtered };
  }

  if (path === "/passenger-requests" && method === "POST") {
    const requests = clientFallbackDb.getPassengerRequests();
    const passenger =
      clientFallbackDb.getUsers().find((u) => u.id === userId) ||
      clientFallbackDb.getUsers()[1];

    const newRequest = {
      id: `pr_${Date.now()}`,
      passengerId: passenger.id,
      passengerName: passenger.name,
      passengerPhoto: passenger.profilePicture,
      passengerRating: passenger.rating,
      isVerified:
        passenger.verificationStatus === "verified" ||
        passenger.governmentIdVerified,
      origin: body.origin,
      destination: body.destination,
      date: body.date,
      time: body.time,
      flexibleTime: body.flexibleTime || "Any Time",
      seatsNeeded: parseInt(body.seatsNeeded) || 1,
      maxPrice: parseInt(body.maxPrice) || 300,
      note: body.note || "",
      status: "searching",
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    clientFallbackDb.saveData("rl_passenger_requests", requests);
    return { success: true, request: newRequest };
  }

  if (path.startsWith("/passenger-requests/") && method === "PUT") {
    const requests = clientFallbackDb.getPassengerRequests();
    const requestId = path.split("/").pop();
    const idx = requests.findIndex((r) => r.id === requestId);

    if (idx === -1) return { success: false, message: "Request not found" };

    const req = requests[idx];
    const { action, offeredRideId, date, time } = body;

    if (action === "send_offer") {
      req.status = "offer_received";
      req.offeredRideId = offeredRideId;
      const ride = clientFallbackDb
        .getRides()
        .find((r) => r.id === offeredRideId);
      if (ride) {
        req.offeredRide = ride;
      }
    } else if (action === "accept_offer") {
      const rides = clientFallbackDb.getRides();
      const bookings = clientFallbackDb.getBookings();
      const rideIdx = rides.findIndex((r) => r.id === req.offeredRideId);

      if (rideIdx === -1) {
        return {
          success: false,
          message: "Offered ride is no longer available",
        };
      }

      const ride = rides[rideIdx];
      const newBooking = {
        id: `booking_${Date.now()}`,
        rideId: ride.id,
        passengerId: req.passengerId,
        passengerName: req.passengerName,
        seatsBooked: req.seatsNeeded,
        status: "accepted",
        paymentStatus: "paid",
        price: ride.contributionAmount * req.seatsNeeded,
        createdAt: new Date().toISOString(),
      };

      bookings.push(newBooking);
      ride.seatsAvailable = Math.max(0, ride.seatsAvailable - req.seatsNeeded);
      ride.passengers.push(req.passengerId);

      req.status = "confirmed";
      req.bookingId = newBooking.id;

      clientFallbackDb.saveData("rl_bookings", bookings);
      clientFallbackDb.saveData("rl_rides", rides);
    } else if (action === "repost") {
      req.status = "searching";
      if (date) req.date = date;
      if (time) req.time = time;
    } else if (action === "complete") {
      req.status = "completed";
    } else if (action === "cancel") {
      req.status = "cancelled";
    }

    requests[idx] = req;
    clientFallbackDb.saveData("rl_passenger_requests", requests);
    return { success: true, request: req };
  }

  return { success: false, message: "Endpoint fallback not implemented" };
}

// API Export Methods
export const api = {
  // Auth
  login: (data) =>
    fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  signup: (data) =>
    fetchApi("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchApi("/auth/me"),
  updateProfile: (data) =>
    fetchApi("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Rides
  searchRides: (filters) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchApi(`/rides?${query.toString()}`);
  },

  getRideDetails: (id) => fetchApi(`/rides/${id}`),

  createRide: (data) =>
    fetchApi("/rides", { method: "POST", body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data) =>
    fetchApi("/bookings", { method: "POST", body: JSON.stringify(data) }),

  getBookings: () => fetchApi("/bookings"),

  updateBookingStatus: (id, data) =>
    fetchApi(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Chat
  getMessages: (rideId) => fetchApi(`/chats/${rideId}`),

  sendMessage: (rideId, text) =>
    fetchApi(`/chats/${rideId}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Admin
  getAdminStats: () => fetchApi("/admin/stats"),

  // Passenger Requests
  getPassengerRequests: (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    return fetchApi(`/passenger-requests?${query.toString()}`);
  },

  createPassengerRequest: (data) =>
    fetchApi("/passenger-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePassengerRequest: (id, data) =>
    fetchApi(`/passenger-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
