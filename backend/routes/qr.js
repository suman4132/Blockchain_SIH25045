const express = require('express');
const QRCode = require('qrcode');
const { auth, requireApproval } = require('../middleware/auth');
const ProduceBatch = require('../models/ProduceBatch');
const Transaction = require('../models/Transaction');

const router = express.Router();

// @route   POST /api/qr/generate
// @desc    Generate QR code for a batch
// @access  Private (Farmer)
router.post('/generate', auth, requireApproval, async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is required' });
    }

    const batch = await ProduceBatch.findOne({ 
      batchId, 
      farmer: req.user._id 
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Generate QR code data
    const qrData = {
      batchId: batch.batchId,
      crop: batch.crop,
      variety: batch.variety,
      harvestDate: batch.harvestDate,
      farmer: {
        name: req.user.name,
        id: req.user._id
      },
      origin: batch.origin,
      timestamp: new Date().toISOString()
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#0b6b3a',
        light: '#ffffff'
      }
    });

    // Update batch with QR code
    batch.qrCode = {
      data: JSON.stringify(qrData),
      imageUrl: qrCodeDataURL,
      generatedAt: new Date()
    };

    await batch.save();

    res.json({
      message: 'QR code generated successfully',
      qrCode: {
        data: qrData,
        imageUrl: qrCodeDataURL
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'Server error during QR generation' });
  }
});

// @route   POST /api/qr/scan
// @desc    Scan QR code and get batch details
// @access  Private
router.post('/scan', auth, requireApproval, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    const { batchId } = parsedData;

    // Find batch with full details
    const batch = await ProduceBatch.findOne({ batchId })
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

    // Calculate trust meter
    const trustScore = calculateTrustScore(batch, transactions);

    res.json({
      message: 'Batch details retrieved successfully',
      batch: {
        ...batch.toObject(),
        trustScore
      },
      transactions,
      provenance: {
        origin: batch.origin,
        harvestDate: batch.harvestDate,
        farmer: batch.farmer,
        currentOwner: batch.currentOwner,
        transportHistory: batch.transportConditions
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'Server error during QR scan' });
  }
});

// @route   GET /api/qr/batch/:batchId
// @desc    Get batch details by ID
// @access  Private
router.get('/batch/:batchId', auth, requireApproval, async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await ProduceBatch.findOne({ batchId })
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

    // Calculate trust score
    const trustScore = calculateTrustScore(batch, transactions);

    res.json({
      batch: {
        ...batch.toObject(),
        trustScore
      },
      transactions
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate trust score
function calculateTrustScore(batch, transactions) {
  let score = 0;
  let factors = 0;

  // Farmer rating (40% weight)
  if (batch.farmer.rating > 0) {
    score += batch.farmer.rating * 0.4;
    factors += 0.4;
  }

  // Batch quality (20% weight)
  if (batch.quality.grade) {
    const gradeScore = { 'A': 5, 'B': 4, 'C': 3, 'D': 2 }[batch.quality.grade] || 0;
    score += gradeScore * 0.2;
    factors += 0.2;
  }

  // Transaction history (20% weight)
  if (transactions.length > 0) {
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const transactionScore = Math.min(completedTransactions / 3, 1) * 5; // Max 5 for 3+ transactions
    score += transactionScore * 0.2;
    factors += 0.2;
  }

  // Reviews (20% weight)
  if (batch.reviews.length > 0) {
    const avgReviewRating = batch.reviews.reduce((sum, review) => sum + review.rating, 0) / batch.reviews.length;
    score += avgReviewRating * 0.2;
    factors += 0.2;
  }

  return factors > 0 ? Math.round((score / factors) * 10) / 10 : 0;
}

module.exports = router;


