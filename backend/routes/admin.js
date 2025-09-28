const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const ProduceBatch = require('../models/ProduceBatch');
const Transaction = require('../models/Transaction');
const PriceData = require('../models/PriceData');
const csvWriter = require('csv-writer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalBatches,
      totalTransactions,
      pendingApprovals,
      recentUsers,
      recentBatches,
      recentTransactions,
      priceData
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      ProduceBatch.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      User.countDocuments({ isApproved: false }),
      User.find({ isActive: true })
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      ProduceBatch.find({ isActive: true })
        .populate('farmer', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Transaction.find()
        .populate('from', 'name role')
        .populate('to', 'name role')
        .populate('batch', 'crop variety')
        .sort({ createdAt: -1 })
        .limit(5),
      PriceData.aggregate([
        { $match: { isActive: true } },
        { $group: {
          _id: '$crop',
          averagePrice: { $avg: '$price.average' },
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

    // Calculate growth metrics
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      newUsersThisMonth,
      newBatchesThisMonth,
      newTransactionsThisMonth
    ] = await Promise.all([
      User.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: lastMonth } 
      }),
      ProduceBatch.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: lastMonth } 
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: lastMonth } 
      })
    ]);

    // User role distribution
    const userRoleDistribution = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Transaction status distribution
    const transactionStatusDistribution = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue metrics
    const revenueData = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalRevenue: { $sum: '$totalAmount' },
        transactionCount: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalBatches,
        totalTransactions,
        pendingApprovals
      },
      growth: {
        newUsersThisMonth,
        newBatchesThisMonth,
        newTransactionsThisMonth
      },
      distributions: {
        userRoles: userRoleDistribution,
        transactionStatus: transactionStatusDistribution
      },
      recent: {
        users: recentUsers,
        batches: recentBatches,
        transactions: recentTransactions
      },
      priceData,
      revenueData
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/export
// @desc    Export data as CSV
// @access  Private (Admin)
router.get('/reports/export', auth, authorize('admin'), async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({ message: 'Report type is required' });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await User.find({
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }).select('name email role phone createdAt isApproved');
        filename = `users_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;
        break;

      case 'batches':
        data = await ProduceBatch.find({
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }).populate('farmer', 'name email').select('batchId crop variety quantity unit expectedPrice harvestDate farmer createdAt');
        filename = `batches_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;
        break;

      case 'transactions':
        data = await Transaction.find({
          createdAt: { $gte: start, $lte: end }
        }).populate('from', 'name role').populate('to', 'name role').populate('batch', 'crop variety');
        filename = `transactions_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;
        break;

      case 'prices':
        data = await PriceData.find({
          createdAt: { $gte: start, $lte: end },
          isActive: true
        });
        filename = `prices_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Convert to CSV format
    const csvData = data.map(item => {
      const obj = item.toObject();
      // Flatten nested objects
      if (obj.farmer) {
        obj.farmerName = obj.farmer.name;
        obj.farmerEmail = obj.farmer.email;
        delete obj.farmer;
      }
      if (obj.from) {
        obj.fromName = obj.from.name;
        obj.fromRole = obj.from.role;
        delete obj.from;
      }
      if (obj.to) {
        obj.toName = obj.to.name;
        obj.toRole = obj.to.role;
        delete obj.to;
      }
      if (obj.batch) {
        obj.batchCrop = obj.batch.crop;
        obj.batchVariety = obj.batch.variety;
        delete obj.batch;
      }
      return obj;
    });

    const csv = csvWriter.createObjectCsvWriter({
      path: filename,
      header: Object.keys(csvData[0] || {}).map(key => ({ id: key, title: key }))
    });

    await csv.writeRecords(csvData);

    res.download(filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file
      fs.unlink(filename, (unlinkErr) => {
        if (unlinkErr) console.error('File cleanup error:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

// @route   GET /api/admin/reports/pdf
// @desc    Generate PDF report
// @access  Private (Admin)
router.get('/reports/pdf', auth, authorize('admin'), async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({ message: 'Report type is required' });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const doc = new PDFDocument();
    const filename = `report_${type}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Farm2Shelf Report', 50, 50);
    doc.fontSize(12).text(`Report Type: ${type.toUpperCase()}`, 50, 80);
    doc.text(`Period: ${start.toDateString()} - ${end.toDateString()}`, 50, 100);

    let yPosition = 130;

    switch (type) {
      case 'users':
        const users = await User.find({
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }).select('name email role createdAt isApproved');

        doc.text('User Report', 50, yPosition);
        yPosition += 30;

        users.forEach((user, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
          doc.text(`${index + 1}. ${user.name} (${user.email})`, 70, yPosition);
          doc.text(`   Role: ${user.role}, Approved: ${user.isApproved}`, 70, yPosition + 15);
          yPosition += 35;
        });
        break;

      case 'batches':
        const batches = await ProduceBatch.find({
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }).populate('farmer', 'name email').select('batchId crop variety quantity unit expectedPrice harvestDate farmer createdAt');

        doc.text('Batch Report', 50, yPosition);
        yPosition += 30;

        batches.forEach((batch, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
          doc.text(`${index + 1}. ${batch.batchId}`, 70, yPosition);
          doc.text(`   Crop: ${batch.crop} ${batch.variety}`, 70, yPosition + 15);
          doc.text(`   Quantity: ${batch.quantity} ${batch.unit}`, 70, yPosition + 30);
          doc.text(`   Farmer: ${batch.farmer.name}`, 70, yPosition + 45);
          yPosition += 65;
        });
        break;

      case 'transactions':
        const transactions = await Transaction.find({
          createdAt: { $gte: start, $lte: end }
        }).populate('from', 'name role').populate('to', 'name role').populate('batch', 'crop variety');

        doc.text('Transaction Report', 50, yPosition);
        yPosition += 30;

        transactions.forEach((transaction, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
          doc.text(`${index + 1}. ${transaction.transactionId}`, 70, yPosition);
          doc.text(`   From: ${transaction.from.name} (${transaction.from.role})`, 70, yPosition + 15);
          doc.text(`   To: ${transaction.to.name} (${transaction.to.role})`, 70, yPosition + 30);
          doc.text(`   Amount: ₹${transaction.totalAmount}`, 70, yPosition + 45);
          doc.text(`   Status: ${transaction.status}`, 70, yPosition + 60);
          yPosition += 80;
        });
        break;
    }

    doc.end();
  } catch (error) {
    console.error('PDF report error:', error);
    res.status(500).json({ message: 'Server error during PDF generation' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // User registration trends
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Transaction trends
    const transactionTrends = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Crop distribution
    const cropDistribution = await ProduceBatch.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$crop',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }},
      { $sort: { count: -1 } }
    ]);

    // Geographic distribution
    const geoDistribution = await ProduceBatch.aggregate([
      { $match: { 
        isActive: true,
        'origin.coordinates': { $exists: true }
      }},
      { $group: {
        _id: {
          state: '$origin.address.state',
          city: '$origin.address.city'
        },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      userTrends,
      transactionTrends,
      cropDistribution,
      geoDistribution
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


