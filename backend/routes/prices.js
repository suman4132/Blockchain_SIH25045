const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireApproval } = require('../middleware/auth');
const PriceData = require('../models/PriceData');

const router = express.Router();

// @route   GET /api/prices
// @desc    Get current prices for crops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { crop, market, limit = 50 } = req.query;

    const query = { isActive: true };
    if (crop) query.crop = crop;
    if (market) query['market.name'] = new RegExp(market, 'i');

    const prices = await PriceData.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ prices });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prices/top-crops
// @desc    Get top crops with current prices
// @access  Public
router.get('/top-crops', async (req, res) => {
  try {
    const topCrops = ['wheat', 'rice', 'corn', 'potato', 'tomato', 'onion', 'sugarcane', 'cotton'];
    
    const prices = await PriceData.aggregate([
      { $match: { isActive: true, crop: { $in: topCrops } } },
      { $sort: { date: -1 } },
      { $group: {
        _id: '$crop',
        latestPrice: { $first: '$price' },
        latestDate: { $first: '$date' },
        market: { $first: '$market' },
        variety: { $first: '$variety' }
      }},
      { $sort: { latestDate: -1 } }
    ]);

    res.json({ prices });
  } catch (error) {
    console.error('Get top crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prices/trends/:crop
// @desc    Get price trends for a specific crop
// @access  Public
router.get('/trends/:crop', async (req, res) => {
  try {
    const { crop } = req.params;
    const { days = 30, market } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      crop,
      isActive: true,
      date: { $gte: startDate }
    };

    if (market) {
      query['market.name'] = new RegExp(market, 'i');
    }

    const trends = await PriceData.find(query)
      .select('price date market variety')
      .sort({ date: 1 });

    res.json({ trends });
  } catch (error) {
    console.error('Get price trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prices
// @desc    Add new price data
// @access  Private (Distributor, Government, Admin)
router.post('/', auth, requireApproval, [
  body('crop').isIn(['wheat', 'rice', 'corn', 'potato', 'tomato', 'onion', 'sugarcane', 'cotton']).withMessage('Invalid crop'),
  body('variety').trim().notEmpty().withMessage('Variety is required'),
  body('market.name').trim().notEmpty().withMessage('Market name is required'),
  body('price.min').isNumeric().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  body('price.max').isNumeric().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  body('price.unit').isIn(['kg', 'quintal', 'ton', 'bag']).withMessage('Invalid price unit')
], async (req, res) => {
  try {
    // Check authorization
    if (!['distributor', 'government', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to add price data' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      crop,
      variety,
      market,
      price,
      quantity,
      quality,
      source = 'mandi'
    } = req.body;

    const priceData = new PriceData({
      crop,
      variety,
      market: {
        name: market.name,
        location: market.location ? {
          type: 'Point',
          coordinates: market.location.coordinates,
          address: market.location.address,
          city: market.location.city,
          state: market.location.state
        } : undefined
      },
      price: {
        min: price.min,
        max: price.max,
        unit: price.unit
      },
      quantity: quantity || { available: 0, unit: price.unit },
      quality: quality || { grade: 'A' },
      source
    });

    await priceData.save();

    res.status(201).json({
      message: 'Price data added successfully',
      priceData
    });
  } catch (error) {
    console.error('Add price data error:', error);
    res.status(500).json({ message: 'Server error during price data addition' });
  }
});

// @route   GET /api/prices/markets
// @desc    Get all markets
// @access  Public
router.get('/markets', async (req, res) => {
  try {
    const markets = await PriceData.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: {
          name: '$market.name',
          city: '$market.city',
          state: '$market.state'
        },
        location: { $first: '$market.location' },
        lastUpdated: { $max: '$date' }
      }},
      { $sort: { lastUpdated: -1 } }
    ]);

    res.json({ markets });
  } catch (error) {
    console.error('Get markets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prices/heatmap
// @desc    Get price data for heatmap visualization
// @access  Public
router.get('/heatmap', async (req, res) => {
  try {
    const { crop, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      isActive: true,
      date: { $gte: startDate },
      'market.location.coordinates': { $exists: true }
    };

    if (crop) query.crop = crop;

    const heatmapData = await PriceData.find(query)
      .select('crop market price date')
      .sort({ date: -1 });

    res.json({ heatmapData });
  } catch (error) {
    console.error('Get heatmap data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


