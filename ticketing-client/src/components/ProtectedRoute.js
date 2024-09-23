import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext); // Include loading

  // Wait for the loading state to complete
  if (loading) {
    console.log('Loading authentication status...');
    return <div>Loading...</div>; // Add a loading indicator if needed
  }

  console.log("Protected Route - isAuthenticated:", isAuthenticated);
  console.log("Protected Route - isAdmin:", isAdmin);
  console.log("Protected Route - adminOnly:", adminOnly);

  if (!isAuthenticated) {
    console.log("User is not authenticated, redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log("User is not an admin, redirecting to home.");
    return <Navigate to="/home" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
