const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize, requireApproval } = require('../middleware/auth');
const ProduceBatch = require('../models/ProduceBatch');
const Transaction = require('../models/Transaction');

const router = express.Router();

// @route   POST /api/batches
// @desc    Create a new produce batch
// @access  Private (Farmer)
router.post('/', auth, authorize('farmer'), requireApproval, [
  body('crop').isIn(['wheat', 'rice', 'corn', 'potato', 'tomato', 'onion', 'sugarcane', 'cotton', 'other']).withMessage('Invalid crop type'),
  body('variety').trim().notEmpty().withMessage('Crop variety is required'),
  body('quantity').isNumeric().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit').isIn(['kg', 'quintal', 'ton', 'bag', 'piece']).withMessage('Invalid unit'),
  body('expectedPrice').isNumeric().isFloat({ min: 0 }).withMessage('Expected price must be positive'),
  body('harvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('origin.coordinates').isArray({ min: 2, max: 2 }).withMessage('Origin coordinates must have longitude and latitude')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      crop,
      variety,
      quantity,
      unit,
      expectedPrice,
      harvestDate,
      origin,
      quality,
      images
    } = req.body;

    // Generate unique batch ID
    const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const batch = new ProduceBatch({
      batchId,
      farmer: req.user._id,
      crop,
      variety,
      quantity,
      unit,
      expectedPrice,
      harvestDate: new Date(harvestDate),
      origin: {
        type: 'Point',
        coordinates: origin.coordinates,
        address: origin.address
      },
      quality: quality || { grade: 'A' },
      images: images || [],
      currentOwner: req.user._id,
      currentLocation: {
        type: 'Point',
        coordinates: origin.coordinates,
        address: origin.address
      }
    });

    await batch.save();

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ message: 'Server error during batch creation' });
  }
});

// @route   GET /api/batches
// @desc    Get all batches with filters
// @access  Private
router.get('/', auth, requireApproval, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      crop,
      status,
      farmer,
      minPrice,
      maxPrice,
      location,
      radius = 50 // km
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (crop) query.crop = crop;
    if (status) query.status = status;
    if (farmer) query.farmer = farmer;

    if (minPrice || maxPrice) {
      query.expectedPrice = {};
      if (minPrice) query.expectedPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.expectedPrice.$lte = parseFloat(maxPrice);
    }

    // Location-based search
    if (location) {
      const [longitude, latitude] = location.split(',').map(Number);
      query.origin = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const batches = await ProduceBatch.find(query)
      .populate('farmer', 'name email phone rating farmerDetails')
      .populate('currentOwner', 'name email phone role rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProduceBatch.countDocuments(query);

    res.json({
      batches,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/batches/:id
// @desc    Get single batch
// @access  Private
router.get('/:id', auth, requireApproval, async (req, res) => {
  try {
    const batch = await ProduceBatch.findById(req.params.id)
      .populate('farmer', 'name email phone rating farmerDetails')
      .populate('currentOwner', 'name email phone role rating')
      .populate('reviews.user', 'name role');

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Get transaction history
    const transactions = await Transaction.find({ batch: batch._id })
      .populate('from', 'name role')
      .populate('to', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      batch,
      transactions
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/batches/:id
// @desc    Update batch
// @access  Private (Farmer - own batches only)
router.put('/:id', auth, authorize('farmer'), requireApproval, async (req, res) => {
  try {
    const batch = await ProduceBatch.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found or access denied' });
    }

    const allowedUpdates = ['variety', 'expectedPrice', 'quality', 'images'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedBatch = await ProduceBatch.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('farmer', 'name email phone rating');

    res.json({
      message: 'Batch updated successfully',
      batch: updatedBatch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ message: 'Server error during batch update' });
  }
});

// @route   DELETE /api/batches/:id
// @desc    Delete batch
// @access  Private (Farmer - own batches only)
router.delete('/:id', auth, authorize('farmer'), requireApproval, async (req, res) => {
  try {
    const batch = await ProduceBatch.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found or access denied' });
    }

    // Soft delete
    batch.isActive = false;
    await batch.save();

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ message: 'Server error during batch deletion' });
  }
});

// @route   POST /api/batches/:id/review
// @desc    Add review to batch
// @access  Private
router.post('/:id/review', auth, requireApproval, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const batch = await ProduceBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if user already reviewed
    const existingReview = batch.reviews.find(review => 
      review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this batch' });
    }

    // Add review
    batch.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Recalculate average rating
    batch.calculateAverageRating();
    await batch.save();

    res.json({
      message: 'Review added successfully',
      batch: await ProduceBatch.findById(req.params.id)
        .populate('reviews.user', 'name role')
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error during review addition' });
  }
});

// @route   GET /api/batches/farmer/my-batches
// @desc    Get farmer's own batches
// @access  Private (Farmer)
router.get('/farmer/my-batches', auth, authorize('farmer'), requireApproval, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { farmer: req.user._id, isActive: true };
    if (status) query.status = status;

    const batches = await ProduceBatch.find(query)
      .populate('currentOwner', 'name email phone role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProduceBatch.countDocuments(query);

    res.json({
      batches,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get farmer batches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


