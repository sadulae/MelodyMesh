// src/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate(); 
    
    const login = (email) => {
        setIsAuthenticated(true);
        setUserEmail(email);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserEmail('');
    };

    const signOut = () => {
        setUserEmail(null);
        // Perform additional sign out logic here, like clearing a token
        navigate('/login'); // Navigate to the login page after sign out
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout,signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
