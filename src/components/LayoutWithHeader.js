// src/components/LayoutWithHeader.js
import React from 'react';
import Header from './Header';

const LayoutWithHeader = ({ children }) => {
    return (
        <>
            <Header />
            <div className="content">
                {children}
            </div>
        </>
    );
};

export default LayoutWithHeader;
