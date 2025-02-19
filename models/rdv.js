const mongoose = require('mongoose');

const etapeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  descriptif: {
    type: String,
    required: true,
    trim: true
  }
});

const rdvSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['proposé','attente de demarrage', 'en cours','SAV','attente de facturation','attente de payement', 'fini', 'annulé'],
    default: 'proposé'
  },
  attachments: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],
  etapes: [etapeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Rdv', rdvSchema);