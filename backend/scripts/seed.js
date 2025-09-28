const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const ProduceBatch = require('../models/ProduceBatch');
const Transaction = require('../models/Transaction');
const PriceData = require('../models/PriceData');

// Sample data
const sampleUsers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@farmer.com',
    password: 'password123',
    role: 'farmer',
    phone: '+91-9876543210',
    address: {
      street: 'Village Road 1',
      city: 'Punjab',
      state: 'Punjab',
      pincode: '141001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [75.8577, 30.7333] // Ludhiana
    },
    farmerDetails: {
      farmName: 'Kumar Farms',
      farmSize: 25,
      crops: ['wheat', 'rice', 'corn'],
      certifications: ['Organic', 'GAP'],
      yearsOfExperience: 15
    },
    isApproved: true,
    isVerified: true
  },
  {
    name: 'Amit Singh',
    email: 'amit@distributor.com',
    password: 'password123',
    role: 'distributor',
    phone: '+91-9876543211',
    address: {
      street: 'Mandi Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041] // Delhi
    },
    distributorDetails: {
      businessName: 'Singh Distribution Co.',
      licenseNumber: 'DIST-2023-001',
      storageCapacity: 1000,
      transportFleet: ['Truck-001', 'Truck-002']
    },
    isApproved: true,
    isVerified: true
  },
  {
    name: 'Priya Sharma',
    email: 'priya@retailer.com',
    password: 'password123',
    role: 'retailer',
    phone: '+91-9876543212',
    address: {
      street: 'Market Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai
    },
    retailerDetails: {
      storeName: 'Sharma Fresh Mart',
      storeType: 'Supermarket',
      location: 'Andheri West',
      operatingHours: '6 AM - 10 PM'
    },
    isApproved: true,
    isVerified: true
  },
  {
    name: 'Suresh Patel',
    email: 'suresh@consumer.com',
    password: 'password123',
    role: 'consumer',
    phone: '+91-9876543213',
    address: {
      street: 'Residential Area',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore
    },
    isApproved: true,
    isVerified: true
  },
  {
    name: 'Dr. Meera Joshi',
    email: 'meera@gov.com',
    password: 'password123',
    role: 'government',
    phone: '+91-9876543214',
    address: {
      street: 'Government Office',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // New Delhi
    },
    governmentDetails: {
      department: 'Ministry of Agriculture',
      designation: 'Deputy Director',
      employeeId: 'GOV-2023-001'
    },
    isApproved: true,
    isVerified: true
  },
  {
    name: 'Admin User',
    email: 'admin@farm2shelf.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91-9876543215',
    address: {
      street: 'Admin Office',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139]
    },
    isApproved: true,
    isVerified: true
  }
];

const sampleBatches = [
  {
    batchId: 'BATCH_001_WHEAT',
    crop: 'wheat',
    variety: 'Durum',
    quantity: 1000,
    unit: 'kg',
    expectedPrice: 25,
    harvestDate: new Date('2023-10-15'),
    origin: {
      type: 'Point',
      coordinates: [75.8577, 30.7333],
      address: {
        street: 'Village Road 1',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001',
        country: 'India'
      }
    },
    quality: {
      grade: 'A',
      moisture: 12,
      purity: 98,
      defects: 2,
      certifications: ['Organic']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
        caption: 'Wheat harvest field'
      }
    ],
    status: 'harvested'
  },
  {
    batchId: 'BATCH_002_RICE',
    crop: 'rice',
    variety: 'Basmati',
    quantity: 800,
    unit: 'kg',
    expectedPrice: 45,
    harvestDate: new Date('2023-10-20'),
    origin: {
      type: 'Point',
      coordinates: [77.1025, 28.7041],
      address: {
        street: 'Farm Road 2',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      }
    },
    quality: {
      grade: 'A',
      moisture: 14,
      purity: 99,
      defects: 1,
      certifications: ['Premium']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        caption: 'Basmati rice field'
      }
    ],
    status: 'harvested'
  },
  {
    batchId: 'BATCH_003_TOMATO',
    crop: 'tomato',
    variety: 'Cherry',
    quantity: 500,
    unit: 'kg',
    expectedPrice: 30,
    harvestDate: new Date('2023-10-25'),
    origin: {
      type: 'Point',
      coordinates: [72.8777, 19.0760],
      address: {
        street: 'Greenhouse Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      }
    },
    quality: {
      grade: 'A',
      moisture: 85,
      purity: 95,
      defects: 5,
      certifications: ['Hydroponic']
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546470427-5a4b0b4b0b4b?w=400',
        caption: 'Cherry tomatoes'
      }
    ],
    status: 'harvested'
  }
];

const samplePriceData = [
  {
    crop: 'wheat',
    variety: 'Durum',
    market: {
      name: 'Ludhiana Mandi',
      location: {
        type: 'Point',
        coordinates: [75.8577, 30.7333],
        address: 'Ludhiana Mandi, Punjab',
        city: 'Ludhiana',
        state: 'Punjab'
      }
    },
    price: {
      min: 22,
      max: 28,
      unit: 'kg'
    },
    quantity: {
      available: 5000,
      unit: 'kg'
    },
    quality: {
      grade: 'A',
      moisture: 12
    },
    source: 'mandi'
  },
  {
    crop: 'rice',
    variety: 'Basmati',
    market: {
      name: 'Delhi Mandi',
      location: {
        type: 'Point',
        coordinates: [77.1025, 28.7041],
        address: 'Delhi Mandi, Delhi',
        city: 'Delhi',
        state: 'Delhi'
      }
    },
    price: {
      min: 40,
      max: 50,
      unit: 'kg'
    },
    quantity: {
      available: 3000,
      unit: 'kg'
    },
    quality: {
      grade: 'A',
      moisture: 14
    },
    source: 'mandi'
  },
  {
    crop: 'tomato',
    variety: 'Cherry',
    market: {
      name: 'Mumbai APMC',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760],
        address: 'Mumbai APMC, Maharashtra',
        city: 'Mumbai',
        state: 'Maharashtra'
      }
    },
    price: {
      min: 25,
      max: 35,
      unit: 'kg'
    },
    quantity: {
      available: 2000,
      unit: 'kg'
    },
    quality: {
      grade: 'A',
      moisture: 85
    },
    source: 'mandi'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2shelf');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ProduceBatch.deleteMany({});
    await Transaction.deleteMany({});
    await PriceData.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    }

    // Create batches
    const batches = [];
    for (let i = 0; i < sampleBatches.length; i++) {
      const batchData = sampleBatches[i];
      const farmer = users.find(u => u.role === 'farmer');
      
      const batch = new ProduceBatch({
        ...batchData,
        farmer: farmer._id,
        currentOwner: farmer._id,
        currentLocation: batchData.origin
      });
      
      await batch.save();
      batches.push(batch);
      console.log(`Created batch: ${batch.batchId}`);
    }

    // Create transactions
    const farmer = users.find(u => u.role === 'farmer');
    const distributor = users.find(u => u.role === 'distributor');
    const retailer = users.find(u => u.role === 'retailer');
    const consumer = users.find(u => u.role === 'consumer');

    // Farmer to Distributor transaction
    const transaction1 = new Transaction({
      transactionId: 'TXN_001',
      batch: batches[0]._id,
      from: farmer._id,
      to: distributor._id,
      type: 'sale',
      quantity: 500,
      unit: 'kg',
      pricePerUnit: 25,
      totalAmount: 12500,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'completed',
      status: 'completed',
      location: {
        type: 'Point',
        coordinates: [75.8577, 30.7333],
        address: 'Ludhiana Mandi',
        city: 'Ludhiana',
        state: 'Punjab'
      }
    });
    await transaction1.save();

    // Distributor to Retailer transaction
    const transaction2 = new Transaction({
      transactionId: 'TXN_002',
      batch: batches[0]._id,
      from: distributor._id,
      to: retailer._id,
      type: 'sale',
      quantity: 300,
      unit: 'kg',
      pricePerUnit: 30,
      totalAmount: 9000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'completed',
      status: 'completed',
      location: {
        type: 'Point',
        coordinates: [77.1025, 28.7041],
        address: 'Delhi Distribution Center',
        city: 'Delhi',
        state: 'Delhi'
      }
    });
    await transaction2.save();

    // Retailer to Consumer transaction
    const transaction3 = new Transaction({
      transactionId: 'TXN_003',
      batch: batches[0]._id,
      from: retailer._id,
      to: consumer._id,
      type: 'sale',
      quantity: 50,
      unit: 'kg',
      pricePerUnit: 35,
      totalAmount: 1750,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      status: 'completed',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: 'Sharma Fresh Mart',
        city: 'Bangalore',
        state: 'Karnataka'
      }
    });
    await transaction3.save();

    console.log('Created transactions');

    // Create price data
    for (const priceData of samplePriceData) {
      const price = new PriceData(priceData);
      await price.save();
      console.log(`Created price data for ${price.crop} at ${price.market.name}`);
    }

    // Update batch statuses and owners
    batches[0].status = 'sold';
    batches[0].currentOwner = consumer._id;
    await batches[0].save();

    console.log('Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Farmer: rajesh@farmer.com / password123');
    console.log('Distributor: amit@distributor.com / password123');
    console.log('Retailer: priya@retailer.com / password123');
    console.log('Consumer: suresh@consumer.com / password123');
    console.log('Government: meera@gov.com / password123');
    console.log('Admin: admin@farm2shelf.com / admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };


