import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.css';

const SelectBandsForm = () => {
    const [event, setEvent] = useState('');
    const [band, setBand] = useState('');
    const [performers, setPerformers] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const imageSrc = location.state?.imageSrc || 'default-image.jpg'; // Fallback to a default image if imageSrc is null/undefined

    const handleBack = () => navigate(-1);

    const handleClearAll = () => {
        setEvent('');
        setBand('');
        setPerformers('');
        setTimeSlot('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (event && band && performers && timeSlot) {
            const newDetail = { event,band, performers, timeSlot };

            try {
                const response = await fetch('http://localhost:5000/api/save-band', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newDetail),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                console.log('Success:', result);
                navigate('/change-bands', { state: { newDetail, imageSrc } });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="select-bands-container">
            <div className="image-container">
                <img src={imageSrc} alt="Event Poster" className="event-image" />
            </div>
            <div className="form-container">
                <h2><u className='u1'>Select Band & Performers</u></h2>
                <form onSubmit={handleSubmit}>

                <div className="form-group">
                        <label>Select Event:</label>
                        <select value={event} onChange={(e) => setEvent(e.target.value)}>
                            <option value="">Select Event</option>
                            <option value="Dj Party 2024">Dj Party 2024</option>
                            <option value="Viramaya">Viramaya</option>
                            <option value="X-Ban 24">X-ban 24</option>
                            <option value="GanThera-24">GanThera-24</option>
                            <option value="Hikka V.Day Flash">Hikka V.Day Flash</option>
                            <option value="Sundown Live Concert">Sundown Live Concert</option>
                            <option value="Zyke Live Concert">Zyke Live Concert</option>
                            <option value="SundayFunday Beach Party">SundayFunday Beach Party</option>

                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Band:</label>
                        <select value={band} onChange={(e) => setBand(e.target.value)}>
                            <option value="">Select Band</option>
                            <option value="infinity">Infinity</option>
                            <option value="Wayo">Wayo</option>
                            <option value="News">News</option>
                            <option value="MidLan">MidLan</option>
                            <option value="Daddy Band">Daddy Band</option>
                            <option value="Flashback Band ">Flashback Band</option>
                            <option value="Avatra Band ">Avatra Band</option>
                            <option value="Mariance Band ">Mariance Band</option>

                        </select>
                    </div>
                    <div className="form-group">
                        <label>Select Performers:</label>
                        <select value={performers} onChange={(e) => setPerformers(e.target.value)}>
                            <option value="">Select Performers</option>
                            <option value="Nadeemal Perera">Nadeemal Perera</option>
                            <option value="Sanuka Wickramasinghe">Sanuka Wickramasinghe</option>
                            <option value="Chamara Weerasingha">Chamara Weerasingha</option>
                            <option value="Pyath Rajapaksha">Pyath Rajapaksha</option>
                            <option value="BnS">BnS</option>
                            <option value="Wasthi">Wasthi</option>
                            <option value="Dinesh Gamage">Dinesh Gamage</option>
                            <option value="Raini Charuka">Raini Charuka</option>

                        </select>
                    </div>
                    <div className="form-group">
                        <label>Select Time Slot:</label>
                        <input type="time" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} />
                    </div>
                    <div className="button-group">
                        <button type="button" onClick={handleBack}>Back</button>
                        <button type="button" onClick={handleClearAll}>Clear All</button>
                        <button type="submit">Send</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SelectBandsForm;
