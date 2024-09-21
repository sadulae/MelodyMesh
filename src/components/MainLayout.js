// src/components/MainLayout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <Header />
            {children}
            <Footer />
        </div>
    );
};

export default MainLayout;
