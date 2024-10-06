const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    imageSrc: String,
    description: String,
    date: Date,
    location: String,
    posterUrl: String,
    tiers: Array
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

