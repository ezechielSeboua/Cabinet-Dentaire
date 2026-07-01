import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../services/authService"; // Make sure this path is correct

const ProtectedRouteLayout = () => {
  const currentUser = getCurrentUser();
  const location = useLocation();

  // If getCurrentUser() correctly returns null, this check will work.
  if (!currentUser) {
    // Redirect to login, remembering the page they tried to visit.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // console.log("currentUser", currentUser);
  // If the user exists, render the child route (e.g., <Dashboard />, <Patients />, etc.)
  return <Outlet />;
};

export default ProtectedRouteLayout;
// This component can be used in your routing setup to protect routes that require authentication.
// For example, in your App.js or routes file:
