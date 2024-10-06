// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import { useAuth } from '../AuthContext';

const Header = () => {

    const { userEmail } = useAuth();

    return (
        <header className="header">
            <nav>
                <Link className='header-h1' to="/select-bands">Select Band & Performers</Link>
                <Link className='header-h1' to="/change-bands">Change Band & Performers Details</Link>
                <Link className='header-h1' to="/organize-payments">Organize Bands & Performers Payment</Link>
                <Link className='header-h1' to="/generate-report">Generate Payment Report</Link>
            </nav>
            <div className="user-info">
              <span>Hi, {userEmail}</span>
                <button className="sign-out">Sign Out</button>
            </div>
        </header>
    );
};

export default Header;
