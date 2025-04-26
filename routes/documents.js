const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Document = require('../models/Document');
const { auth, isAdmin } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'noteshelp',
    allowed_formats: ['pdf', 'docx']
  }
});

const upload = multer({ storage: storage });

// Get all documents (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { subject, type, status } = req.query;
    const query = {};

    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (status) query.status = status;

    const documents = await Document.find(query)
      .populate('subject', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('subject', 'name')
      .populate('uploadedBy', 'name')
      .populate('approvedBy', 'name');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

// Upload document
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, type } = req.body;
    const fileType = req.file.originalname.split('.').pop().toLowerCase();

    if (!['pdf', 'docx'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type. Only PDF and DOCX files are allowed.' });
    }

    const document = new Document({
      title,
      subject,
      type,
      fileUrl: req.file.path,
      fileType,
      uploadedBy: req.user._id
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Update document status (admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: req.user._id
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document status', error: error.message });
  }
});

// Delete document (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from Cloudinary
    const publicId = document.fileUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    await document.remove();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

module.exports = router; 