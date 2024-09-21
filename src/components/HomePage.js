import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import '../styles.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { userEmail, signOut } = useAuth();
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const navigateToSelectBands = (imageSrc) => {
        navigate('/select-bands', { state: { imageSrc } });
    };

    const handleSignOut = () => {
        signOut(); // Call signOut to clear the user session
        navigate('/login'); // Navigate to the login page
    };

    return (
        <div className="home-container">
            <aside className={`sidebar ${sidebarVisible ? '' : 'hidden'}`}>
                <h2>
                    MELODY MESH
                    <button className="menu-icon" onClick={toggleSidebar}>
                        ☰
                    </button>
                </h2>
                <nav>
                    <ul>
                        <li>Ticketing Management</li>
                        <li>Sponsor Management</li>
                        <li className="active">Band & Performers Management</li>
                        <li>Organizer Management</li>
                        <li>Volunteer Management</li>
                        <li>Venue Details</li>
                        <li>Sounds & Visual Handling</li>
                    </ul>
                </nav>
            </aside>
            <main className="content">
                <header className="header">
                    <h2><u>Upcoming Events</u></h2>
                    <div className="user-info">
                        <span>Hi, {userEmail}</span>
                        <button onClick={handleSignOut}>Sign Out</button>
                    </div>
                </header>
                <div className="event-cards">
                    <div className="event-card">
                        <img src="/images/hikka_vday_flash.jpg" alt="HIKKA V.DAY FLASH" />
                        <div className="event-actions">
                            <button onClick={() => navigateToSelectBands('/images/hikka_vday_flash.jpg')} className="edit-btn">Edit</button>
                            <button className="view-btn">View</button>
                        </div>
                    </div>
                    <br /><hr />
                    <div className="event-card">
                        <img src="/images/sundown.jpeg" alt="SUNDOWN" />
                        <div className="event-actions">
                            <button onClick={() => navigateToSelectBands('/images/sundown.jpeg')} className="edit-btn">Edit</button>
                            <button className="view-btn">View</button>
                        </div>
                    </div>
                    <br></br><hr></hr>
                    <div className="event-card">
                        <img src="/images/infas.jpeg" alt="IMAGES" />
                        <div className="event-actions">
                            <button onClick={() => navigateToSelectBands('/images/infas.jpeg')} className="edit-btn">Edit</button>
                            <button className="view-btn">View</button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default HomePage;
