const mongoose = require('mongoose');

const priceDataSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    enum: ['wheat', 'rice', 'corn', 'potato', 'tomato', 'onion', 'sugarcane', 'cotton']
  },
  variety: {
    type: String,
    required: true
  },
  market: {
    name: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      },
      address: String,
      city: String,
      state: String
    }
  },
  price: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    average: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'quintal', 'ton', 'bag']
    }
  },
  quantity: {
    available: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'quintal', 'ton', 'bag']
    }
  },
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'A'
    },
    moisture: Number,
    purity: Number
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['mandi', 'farmer', 'distributor', 'government', 'api'],
    default: 'mandi'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
priceDataSchema.index({ crop: 1, date: -1 });
priceDataSchema.index({ 'market.location': '2dsphere' });
priceDataSchema.index({ date: -1, isActive: 1 });
priceDataSchema.index({ crop: 1, variety: 1, date: -1 });

// Calculate average price before saving
priceDataSchema.pre('save', function(next) {
  if (this.isModified('price.min') || this.isModified('price.max')) {
    this.price.average = (this.price.min + this.price.max) / 2;
  }
  next();
});

module.exports = mongoose.model('PriceData', priceDataSchema);

