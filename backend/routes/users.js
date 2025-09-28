const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize, requireApproval } = require('../middleware/auth');
const User = require('../models/User');
const ProduceBatch = require('../models/ProduceBatch');
const Transaction = require('../models/Transaction');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isApproved,
      search
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, requireApproval, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can view this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve user registration
// @access  Private (Admin)
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { isApproved, notes } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = isApproved;
    if (notes) user.approvalNotes = notes;

    await user.save();

    res.json({
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private
router.get('/:id/stats', auth, requireApproval, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check authorization
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get statistics based on user role
    let stats = {};

    if (user.role === 'farmer') {
      const batches = await ProduceBatch.find({ farmer: userId, isActive: true });
      const transactions = await Transaction.find({ from: userId });

      stats = {
        totalBatches: batches.length,
        activeBatches: batches.filter(b => b.status !== 'sold').length,
        soldBatches: batches.filter(b => b.status === 'sold').length,
        totalTransactions: transactions.length,
        totalRevenue: transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.totalAmount, 0),
        averageRating: user.rating
      };
    } else if (user.role === 'distributor' || user.role === 'retailer') {
      const purchaseTransactions = await Transaction.find({ to: userId });
      const saleTransactions = await Transaction.find({ from: userId });

      stats = {
        totalPurchases: purchaseTransactions.length,
        totalSales: saleTransactions.length,
        totalPurchaseValue: purchaseTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.totalAmount, 0),
        totalSaleValue: saleTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.totalAmount, 0),
        averageRating: user.rating
      };
    } else if (user.role === 'consumer') {
      const purchaseTransactions = await Transaction.find({ to: userId });

      stats = {
        totalPurchases: purchaseTransactions.length,
        totalSpent: purchaseTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.totalAmount, 0),
        averageRating: user.rating
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/role/:role
// @desc    Get users by role
// @access  Private
router.get('/role/:role', auth, requireApproval, async (req, res) => {
  try {
    const { role } = req.params;
    const { limit = 20, search } = req.query;

    const query = { role, isApproved: true };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('name email phone rating location')
      .limit(parseInt(limit));

    res.json({ users });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/rating
// @desc    Update user rating
// @access  Private
router.put('/:id/rating', auth, requireApproval, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('transactionId').optional().isMongoId().withMessage('Invalid transaction ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, transactionId, comment } = req.body;
    const targetUserId = req.params.id;

    // Check if user can rate this person
    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // If transactionId provided, verify the transaction exists and user is involved
    if (transactionId) {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.from.toString() !== req.user._id.toString() && 
          transaction.to.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to rate this user' });
      }
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update rating (simple average for now)
    const currentRating = user.rating || 0;
    const totalRatings = user.totalTransactions || 0;
    const newRating = ((currentRating * totalRatings) + rating) / (totalRatings + 1);

    user.rating = Math.round(newRating * 10) / 10;
    user.totalTransactions = (user.totalTransactions || 0) + 1;

    await user.save();

    res.json({
      message: 'Rating updated successfully',
      user: {
        id: user._id,
        name: user.name,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Server error during rating update' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
});

module.exports = router;


