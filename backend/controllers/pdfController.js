const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const Event = require('../models/Event'); // Assuming you have an Event model

// Function to generate a professional-looking PDF
exports.generateOngoingEventsPDF = async (req, res) => {
  try {
    // Fetch ongoing events from the database
    const ongoingEvents = await Event.find({ date: { $gte: new Date() } });

    if (!ongoingEvents || ongoingEvents.length === 0) {
      return res.status(404).json({ message: 'No ongoing events found.' });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Create the first page
    const page = pdfDoc.addPage([600, 800]);

    // Title for the PDF
    const title = 'Ongoing Events List';
    page.drawText(title, {
      x: 150,
      y: 750,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    // Loop through the events and add details to the PDF
    let yPosition = 700;
    ongoingEvents.forEach((event, index) => {
      const eventText = `${index + 1}. ${event.title} - ${event.date.toDateString()}\nLocation: ${event.location}\nDescription: ${event.description}\n`;
      page.drawText(eventText, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 80; // Adjust position for next event
    });

    // Save the PDF as bytes and send it as a response
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ongoing-events.pdf');
    res.send(pdfBytes);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};
