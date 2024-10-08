const express = require('express');
const router = express.Router();

// Import the models
const OrganizerEvents = require('../models/OrganizerEvent');
const Sponsors = require('../models/Sponsor');
const Feedback = require('../models/Feedback');
const Volunteers = require('../models/Volunteer');
const Organizers = require('../models/Organizer');
const Locations = require('../models/NewLocation');
const SoundLighting = require('../models/SoundLighting');
const Event = require('../models/Event'); // <-- Import the Event model

// Consolidated route for fetching all details
router.get('/admin/all-details', async (req, res) => {
    try {
        // Fetch data from all models
        const organizerEvents = await OrganizerEvents.find();
        const sponsors = await Sponsors.find();
        const feedbacks = await Feedback.find();
        const volunteers = await Volunteers.find();
        const organizers = await Organizers.find();
        const locations = await Locations.find();
        const soundLighting = await SoundLighting.find();
        const events = await Event.find(); // <-- Fetch events

        // Log the fetched data (optional)
        console.log('Organizer Events:', organizerEvents);
        console.log('Sponsors:', sponsors);
        console.log('Feedbacks:', feedbacks);
        console.log('Volunteers:', volunteers);
        console.log('Organizers:', organizers);
        console.log('Locations:', locations);
        console.log('Sound and Lighting:', soundLighting);
        console.log('Events:', events); // <-- Log events

        // Send the consolidated JSON response
        res.json({
            organizerEvents,
            sponsors,
            feedbacks,
            volunteers,
            organizers,
            locations,
            soundLighting,
            events // <-- Include events in the response
        });
    } catch (error) {
        console.error('Error fetching data:', error); // Enhanced error logging
        res.status(500).json({ message: "Error fetching data", error });
    }
});

module.exports = router;
