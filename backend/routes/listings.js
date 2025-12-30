const express = require('express');
const Listing = require('../models/Listing');
const { verifyToken } = require('./auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new listing (admin only)
router.post('/', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    console.log('Create listing req.body:', req.body);
    console.log('Create listing req.files:', req.files);
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      // Upload images to Cloudinary
      try {
        const uploadPromises = req.files.map(file =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'efootball' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          })
        );

        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Use placeholder if upload fails
        imageUrls = ['/placeholder.svg'];
      }
    }

    const listingData = {
      ...req.body,
      images: imageUrls.length > 0 ? imageUrls : req.body.images || ['/placeholder.svg'],
    };

    console.log('Listing data:', listingData);
    const listing = new Listing(listingData);
    const newListing = await listing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error('Create error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a listing (admin only)
router.put('/:id', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    console.log('Update listing req.body:', req.body);
    console.log('Update listing req.files:', req.files);
    let imageUrls = req.body.images ? JSON.parse(req.body.images) : [];

    if (req.files && req.files.length > 0) {
      // Upload new images to Cloudinary
      try {
        const uploadPromises = req.files.map(file =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'efootball' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          })
        );

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = newImageUrls; // Overwrite with new images
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Keep existing images if upload fails
      }
    }

    const listingData = {
      ...req.body,
      images: imageUrls,
    };

    console.log('Listing data:', listingData);
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, listingData, { new: true });
    console.log('Updated listing:', updatedListing);
    res.json(updatedListing);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a listing (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;