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

// Consolidated route for fetching all details
router.get('/admin/all-details', async (req, res) => {
    try {
        const organizerEvents = await OrganizerEvents.find();
        const sponsors = await Sponsors.find();
        const feedbacks = await Feedback.find();
        const volunteers = await Volunteers.find();
        const organizers = await Organizers.find();
        const locations = await Locations.find();
        const soundLighting = await SoundLighting.find();

        console.log('Organizer Events:', organizerEvents);
        console.log('Sponsors:', sponsors);
        console.log('Feedbacks:', feedbacks);
        console.log('Volunteers:', volunteers);
        console.log('Organizers:', organizers);
        console.log('Locations:', locations);
        console.log('Sound and Lighting:', soundLighting);

        res.json({
            organizerEvents,
            sponsors,
            feedbacks,
            volunteers,
            organizers,
            locations,
            soundLighting
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
});

module.exports = router;
