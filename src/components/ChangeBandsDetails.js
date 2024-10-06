import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChangeBandsDetails.css';

const ChangeBandsDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const handleBack = () => navigate(-2);

    const [bandDetails, setBandDetails] = useState([
        { event: '', band: '', performers: '', timeSlot: '' },
        
    ]);


    useEffect(() => {
        if (location.state && location.state.newDetail) {
            setBandDetails((prevDetails) => [...prevDetails, location.state.newDetail]);
        }
    }, [location.state]);

    const handleAddBandDetail = () => {
        setBandDetails([...bandDetails, {event: '',  band: '', performers: '', timeSlot: '' }]);
    };

    const handleEditBandDetail = (index, key, value) => {
        const newBandDetails = [...bandDetails];
        newBandDetails[index][key] = value;
        setBandDetails(newBandDetails);
    };

    const handleDeleteBandDetail = (index) => {
        const newBandDetails = bandDetails.filter((_, i) => i !== index);
        setBandDetails(newBandDetails);
    };

    const handleUpdateDetails = () => {
        alert("Details updated successfully!");
    };

    return (
        <div className="change-bands-container">
            <div className="image-and-table-container">
                <div className="image-container">
                    <img src={location.state?.imageSrc || '/images/default.jpg'} alt="Event" className="event-image" />
                </div>
                <div className="table-container">
                    <h2><u>Change B & P Details</u></h2>
                    <h3 className="subheading">Band & Performer Details</h3>
                    <table className="bands-table">
                        <thead>
                            <tr>
                                <th>EVENT</th>
                                <th>BAND</th>
                                <th>PERFORMERS</th>
                                <th>TIME SLOT</th>
                                <th>CURD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bandDetails.map((detail, index) => (
                                <tr key={index}>

                                    <td>
                                        <input
                                            type="text"
                                            value={detail.band}
                                            onChange={(e) => handleEditBandDetail(index, 'event', e.target.value)}
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="text"
                                            value={detail.band}
                                            onChange={(e) => handleEditBandDetail(index, 'band', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={detail.performers}
                                            onChange={(e) => handleEditBandDetail(index, 'performers', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={detail.timeSlot}
                                            onChange={(e) => handleEditBandDetail(index, 'timeSlot', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => handleEditBandDetail(index)}>✏️</button>
                                        <button onClick={() => handleDeleteBandDetail(index)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="4">
                                    <button onClick={handleAddBandDetail}>➕ Add New</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="update-button-container">
                        <button onClick={handleUpdateDetails} className="update-button">Update Details</button>
                    </div>
                </div>
            </div>
            <div className="back-button-container">
                <button type="button" onClick={handleBack}>Back</button>
            </div>
        </div>
    );
};

export default ChangeBandsDetails;