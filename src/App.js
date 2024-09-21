import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SelectBandsForm from './components/SelectBandsForm';
import ChangeBandsDetails from './components/ChangeBandsDetails';
import OrganizePayments from './components/OrganizePayments';
import GeneratePaymentReport from './components/GeneratePaymentReport';
import HomePage from './components/HomePage';
import LayoutWithHeader from './components/LayoutWithHeader';

const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />

            {/* Routes with Header */}
            <Route 
                path="/select-bands" 
                element={<LayoutWithHeader><SelectBandsForm /></LayoutWithHeader>} 
            />
            <Route 
                path="/change-bands" 
                element={<LayoutWithHeader><ChangeBandsDetails /></LayoutWithHeader>} 
            />
            <Route 
                path="/organize-payments" 
                element={<LayoutWithHeader><OrganizePayments /></LayoutWithHeader>} 
            />
            <Route 
                path="/generate-report" 
                element={<LayoutWithHeader><GeneratePaymentReport /></LayoutWithHeader>} 
            />
        </Routes>
    );
};

export default App;
