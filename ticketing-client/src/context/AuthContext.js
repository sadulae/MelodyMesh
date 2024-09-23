import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure named import

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token on load:', decodedToken);

        setIsAuthenticated(true);
        setIsAdmin(decodedToken.isAdmin);
        setUser(decodedToken);
      } catch (error) {
        console.error('Invalid token', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
    }
    setLoading(false); // Set loading to false once the token is processed
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwtDecode(token);
      console.log('Decoded Token on login:', decodedToken);

      setIsAuthenticated(true);
      setIsAdmin(decodedToken.isAdmin);
      setUser(decodedToken);
    } catch (error) {
      console.error('Invalid token', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
