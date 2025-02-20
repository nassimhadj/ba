const express = require('express');
const router = express.Router();
const multer = require('multer');
const Rdv = require('../models/rdv');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('Created uploads directory');
} ;
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage });

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
    if(req.files) {
      req.files.forEach(file => {
        console.log('Absolute file path:', path.resolve(file.path));
        console.log('File details:', {
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          absolutePath: path.resolve(file.path),
          destination: file.destination,
          size: file.size
        });
        console.log('File exists?', fs.existsSync(file.path));
      });
    } ; 
    const newAttachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      uploadDate: new Date()
    })) : [];

    // Get existing attachments from the request
    const existingAttachments = req.body.existingAttachments ? 
      JSON.parse(req.body.existingAttachments) : [];

    // Combine both arrays
    const allAttachments = [...existingAttachments, ...newAttachments];

    const updatedRdv = await Rdv.findByIdAndUpdate(
      req.params.id,
      {
        //...other fields
        attachments: allAttachments
      },
      { new: true }
    );

    res.json(updatedRdv);
  } catch (error) {
    console.error('Error updating RDV:', error);
    res.status(400).json({ error: error.message });
  }
});
// Add this new route to serve images by ID
// Modify this route in your backend
router.get('/image/:attachmentId', async (req, res) => {
  try {
    console.log('Fetching image:', req.params.attachmentId);
    
    const rdv = await Rdv.findOne({
      'attachments._id': req.params.attachmentId
    });
    
    if (!rdv) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const attachment = rdv.attachments.find(
      att => att._id.toString() === req.params.attachmentId
    );

    if (!attachment || !attachment.data) {
      return res.status(404).json({ error: 'Image data not found' });
    }

    res.set('Content-Type', attachment.contentType || 'image/jpeg');
    res.send(Buffer.from(attachment.data, 'base64'));
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new RDV
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    if(req.files) {
      req.files.forEach(file => {
        console.log('Full file path:', path.resolve(file.path));
        console.log('File exists?', fs.existsSync(file.path));
      });
    }
    console.log('Received request:', req.body);
    
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

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,  // Save only filename, not base64
      path: `/uploads/${file.filename}`, // Path to access later
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
      status,
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