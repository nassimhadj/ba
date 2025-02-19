const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ datetime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, date, time, datetime } = req.body;

    const appointment = new Appointment({
      name,
      address,
      phone,
      date,
      time,
      datetime: new Date(datetime)
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete past appointments
router.delete('/cleanup', async (req, res) => {
  try {
    const now = new Date();
    const result = await Appointment.deleteMany({
      datetime: { $lt: now }
    });
    res.json({ message: `Deleted ${result.deletedCount} past appointments` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete specific appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;