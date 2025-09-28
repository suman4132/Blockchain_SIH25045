const mongoose = require('mongoose');

const produceBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: String,
    required: [true, 'Crop type is required'],
    enum: ['wheat', 'rice', 'corn', 'potato', 'tomato', 'onion', 'sugarcane', 'cotton', 'other']
  },
  variety: {
    type: String,
    required: [true, 'Crop variety is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton', 'bag', 'piece'],
    default: 'kg'
  },
  expectedPrice: {
    type: Number,
    required: [true, 'Expected price is required'],
    min: [0, 'Price must be positive']
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required']
  },
  origin: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      default: 'A'
    },
    moisture: Number, // percentage
    purity: Number, // percentage
    defects: Number, // percentage
    certifications: [String]
  },
  status: {
    type: String,
    enum: ['harvested', 'in-transit', 'at-mandi', 'at-retailer', 'sold', 'expired'],
    default: 'harvested'
  },
  qrCode: {
    data: String,
    imageUrl: String,
    generatedAt: { type: Date, default: Date.now }
  },
  blockchainHash: {
    type: String,
    default: ''
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    },
    address: String,
    updatedAt: { type: Date, default: Date.now }
  },
  transportConditions: [{
    temperature: Number,
    humidity: Number,
    timestamp: { type: Date, default: Date.now },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    notes: String
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
produceBatchSchema.index({ origin: '2dsphere' });
produceBatchSchema.index({ currentLocation: '2dsphere' });
produceBatchSchema.index({ farmer: 1, status: 1 });
produceBatchSchema.index({ crop: 1, status: 1 });

// Calculate average rating
produceBatchSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
  }
  return this.averageRating;
};

// Update current location
produceBatchSchema.methods.updateLocation = function(coordinates, address) {
  this.currentLocation = {
    type: 'Point',
    coordinates,
    address,
    updatedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('ProduceBatch', produceBatchSchema);


