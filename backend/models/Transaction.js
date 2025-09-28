const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProduceBatch',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'transfer', 'auction'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton', 'bag', 'piece']
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'crypto', 'credit'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
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
  },
  transportDetails: {
    vehicleNumber: String,
    driverName: String,
    driverPhone: String,
    estimatedArrival: Date,
    actualArrival: Date,
    transportCost: Number
  },
  qualityCheck: {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D']
    },
    moisture: Number,
    purity: Number,
    defects: Number,
    notes: String,
    checkedAt: Date
  },
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'quality_certificate', 'transport_document', 'other']
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  blockchainHash: {
    type: String,
    default: ''
  },
  smartContractAddress: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'initiated'
  },
  notes: String,
  disputeReason: String,
  resolution: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ batch: 1, createdAt: -1 });
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ location: '2dsphere' });

// Calculate total amount before saving
transactionSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('pricePerUnit')) {
    this.totalAmount = this.quantity * this.pricePerUnit;
  }
  next();
});

// Update batch status based on transaction
transactionSchema.post('save', async function() {
  if (this.status === 'completed') {
    const ProduceBatch = mongoose.model('ProduceBatch');
    const batch = await ProduceBatch.findById(this.batch);
    
    if (batch) {
      // Update batch current owner
      batch.currentOwner = this.to;
      
      // Update batch status based on transaction type
      if (this.type === 'sale' && this.to.role === 'retailer') {
        batch.status = 'at-retailer';
      } else if (this.type === 'sale' && this.to.role === 'distributor') {
        batch.status = 'at-mandi';
      }
      
      await batch.save();
    }
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);


