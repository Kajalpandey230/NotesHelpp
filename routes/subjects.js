const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { auth, isAdmin } = require('../middleware/auth');

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
});

// Get single subject
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subject', error: error.message });
  }
});

// Create subject (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const subject = new Subject({
      name,
      description
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
});

// Update subject (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subject', error: error.message });
  }
});

// Delete subject (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subject', error: error.message });
  }
});

module.exports = router; 