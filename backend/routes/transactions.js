const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireApproval } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const ProduceBatch = require('../models/ProduceBatch');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, requireApproval, [
  body('batchId').notEmpty().withMessage('Batch ID is required'),
  body('to').isMongoId().withMessage('Valid recipient ID is required'),
  body('type').isIn(['sale', 'purchase', 'transfer', 'auction']).withMessage('Invalid transaction type'),
  body('quantity').isNumeric().isFloat({ min: 0 }).withMessage('Quantity must be positive'),
  body('pricePerUnit').isNumeric().isFloat({ min: 0 }).withMessage('Price per unit must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      batchId,
      to,
      type,
      quantity,
      unit,
      pricePerUnit,
      paymentMethod,
      location,
      transportDetails,
      notes
    } = req.body;

    // Find the batch
    const batch = await ProduceBatch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if user is authorized to create transaction
    if (batch.currentOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to create transaction for this batch' });
    }

    // Validate recipient
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check quantity availability
    if (quantity > batch.quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction = new Transaction({
      transactionId,
      batch: batch._id,
      from: req.user._id,
      to,
      type,
      quantity,
      unit: unit || batch.unit,
      pricePerUnit,
      paymentMethod: paymentMethod || 'cash',
      location: location ? {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        city: location.city,
        state: location.state
      } : undefined,
      transportDetails,
      notes
    });

    await transaction.save();

    // Update batch quantity
    batch.quantity -= quantity;
    if (batch.quantity <= 0) {
      batch.status = 'sold';
    }

    // Update current owner if it's a sale
    if (type === 'sale') {
      batch.currentOwner = to;
    }

    await batch.save();

    // Populate the transaction for response
    await transaction.populate([
      { path: 'batch', select: 'batchId crop variety' },
      { path: 'from', select: 'name email role' },
      { path: 'to', select: 'name email role' }
    ]);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error during transaction creation' });
  }
});

// @route   GET /api/transactions
// @desc    Get transactions with filters
// @access  Private
router.get('/', auth, requireApproval, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      batchId,
      from,
      to,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (batchId) query.batch = batchId;
    if (from) query.from = from;
    if (to) query.to = to;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // If not admin, only show user's transactions
    if (req.user.role !== 'admin') {
      query.$or = [
        { from: req.user._id },
        { to: req.user._id }
      ];
    }

    const transactions = await Transaction.find(query)
      .populate('batch', 'batchId crop variety')
      .populate('from', 'name email role')
      .populate('to', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', auth, requireApproval, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('batch', 'batchId crop variety harvestDate origin')
      .populate('from', 'name email phone role rating')
      .populate('to', 'name email phone role rating')
      .populate('qualityCheck.performedBy', 'name role');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is authorized to view this transaction
    if (req.user.role !== 'admin' && 
        transaction.from._id.toString() !== req.user._id.toString() && 
        transaction.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status
// @access  Private
router.put('/:id/status', auth, requireApproval, [
  body('status').isIn(['initiated', 'in_progress', 'completed', 'cancelled', 'disputed']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes, disputeReason } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        transaction.from.toString() !== req.user._id.toString() && 
        transaction.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update transaction
    transaction.status = status;
    if (notes) transaction.notes = notes;
    if (disputeReason) transaction.disputeReason = disputeReason;

    await transaction.save();

    res.json({
      message: 'Transaction status updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ message: 'Server error during status update' });
  }
});

// @route   POST /api/transactions/:id/quality-check
// @desc    Add quality check to transaction
// @access  Private (Distributor, Government)
router.post('/:id/quality-check', auth, requireApproval, [
  body('grade').isIn(['A', 'B', 'C', 'D']).withMessage('Invalid grade'),
  body('moisture').optional().isNumeric().withMessage('Moisture must be a number'),
  body('purity').optional().isNumeric().withMessage('Purity must be a number'),
  body('defects').optional().isNumeric().withMessage('Defects must be a number'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is authorized for quality check
    if (!['distributor', 'government', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to perform quality checks' });
    }

    const { grade, moisture, purity, defects, notes } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.qualityCheck = {
      performedBy: req.user._id,
      grade,
      moisture,
      purity,
      defects,
      notes,
      checkedAt: new Date()
    };

    await transaction.save();

    res.json({
      message: 'Quality check added successfully',
      transaction
    });
  } catch (error) {
    console.error('Add quality check error:', error);
    res.status(500).json({ message: 'Server error during quality check' });
  }
});

// @route   GET /api/transactions/batch/:batchId
// @desc    Get all transactions for a batch
// @access  Private
router.get('/batch/:batchId', auth, requireApproval, async (req, res) => {
  try {
    const batch = await ProduceBatch.findOne({ batchId: req.params.batchId });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const transactions = await Transaction.find({ batch: batch._id })
      .populate('from', 'name email role')
      .populate('to', 'name email role')
      .populate('qualityCheck.performedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get batch transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


