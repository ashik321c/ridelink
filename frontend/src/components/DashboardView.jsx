"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import DriverDashboard from "./DriverDashboard";
import PassengerDashboard from "./PassengerDashboard";

export default function DashboardView(props) {
  const { user } = useApp();

  if (!user) return null;

  return user.isDriver ? (
    <DriverDashboard {...props} />
  ) : (
    <PassengerDashboard {...props} />
  );
}
