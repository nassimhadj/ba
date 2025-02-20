const express = require('express');
const router = express.Router();
const multer = require('multer');
const Rdv = require('../models/rdv');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limit file size to 5MB
  }
});
// Add this route with your other routes
router.put('/:id/status', async (req, res) => {
  try {
    console.log('Received status update request for ID:', req.params.id);
    console.log('Request body:', req.body);

    const { status, etapes } = req.body;

    // First, find the current document
    const currentRdv = await Rdv.findById(req.params.id);
    if (!currentRdv) {
      console.log('Chantier not found');
      return res.status(404).json({ error: 'Chantier not found' });
    }

    // Build update object only with what needs to be updated
    const updateData = {
      status: status
    };

    // Only include etapes update if new etapes were provided
    if (etapes) {
      updateData.etapes = etapes;
    }

    console.log('Update data:', updateData);

    const rdv = await Rdv.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    console.log('Updated chantier:', rdv);
    res.json(rdv);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
  }
});



router.put('/:id', upload.array('attachments'), async (req, res) => {
  try {
    console.log('Updating RDV:', req.params.id);
    console.log('Request body:', req.body);

    const {
      title,
      email,
      name,
      phone,
      address,
      description,
      status,
      etapes
    } = req.body;

    // Process uploaded files from memory
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      data: file.buffer.toString('base64'), // Store as base64 string
      contentType: file.mimetype,
      uploadDate: new Date()
    })) : [];

    // Find and update the RDV
    const updatedRdv = await Rdv.findByIdAndUpdate(
      req.params.id,
      {
        title,
        email,
        name,
        phone,
        address,
        description,
        status,
        etapes: JSON.parse(etapes || '[]'),
        ...(attachments.length > 0 && { attachments })
      },
      { new: true }
    );

    if (!updatedRdv) {
      return res.status(404).json({ error: 'RDV not found' });
    }

    res.json(updatedRdv);

  } catch (error) {
    console.error('Error updating RDV:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create new RDV
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const {
      title,
      email,
      name,
      phone,
      address,
      description,
      status ,
      etapes
    } = req.body;

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      uploadDate: new Date()
    })) : [];

    // Create new RDV
    const rdv = new Rdv({
      title,
      email,
      name,
      phone,
      address,
      description,
      status  ,
      attachments,
      etapes: JSON.parse(etapes || '[]')
    });

    await rdv.save();
    res.status(201).json(rdv);

  } catch (error) {
    console.error('Error creating RDV:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all RDVs
router.get('/', async (req, res) => {
  try {
    console.log('GET /rdv endpoint hit');
    const rdvs = await Rdv.find();
    console.log('RDVs found:', rdvs);
    res.json(rdvs);
  } catch (error) {
    console.error('Error in GET /rdv:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single RDV
router.get('/:id', async (req, res) => {
  try {
    const rdv = await Rdv.findById(req.params.id);
    if (!rdv) {
      return res.status(404).json({ error: 'RDV not found' });
    }
    res.json(rdv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;