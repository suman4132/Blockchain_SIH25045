const request = require('supertest')
const app = require('../server')
const User = require('../models/User')
const ProduceBatch = require('../models/ProduceBatch')
const Transaction = require('../models/Transaction')

describe('Transaction Routes', () => {
  let authToken
  let farmerId
  let distributorId
  let batchId

  beforeEach(async () => {
    await User.deleteMany({})
    await ProduceBatch.deleteMany({})
    await Transaction.deleteMany({})

    // Create users
    const farmer = new User({
      name: 'Test Farmer',
      email: 'farmer@test.com',
      password: 'password123',
      role: 'farmer',
      phone: '+91-9876543210',
      isApproved: true
    })
    await farmer.save()
    farmerId = farmer._id

    const distributor = new User({
      name: 'Test Distributor',
      email: 'distributor@test.com',
      password: 'password123',
      role: 'distributor',
      phone: '+91-9876543211',
      isApproved: true
    })
    await distributor.save()
    distributorId = distributor._id

    // Create a batch
    const batch = new ProduceBatch({
      batchId: 'BATCH_001',
      farmer: farmerId,
      crop: 'wheat',
      variety: 'Durum',
      quantity: 1000,
      unit: 'kg',
      expectedPrice: 25,
      harvestDate: new Date('2023-10-15'),
      origin: {
        type: 'Point',
        coordinates: [75.8577, 30.7333]
      },
      currentOwner: farmerId
    })
    await batch.save()
    batchId = batch._id

    // Login as farmer
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'farmer@test.com',
        password: 'password123'
      })

    authToken = loginResponse.body.token
  })

  describe('POST /api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const transactionData = {
        batchId: 'BATCH_001',
        to: distributorId,
        type: 'sale',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 25
      }

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201)

      expect(response.body.message).toBe('Transaction created successfully')
      expect(response.body.transaction.type).toBe('sale')
      expect(response.body.transaction.totalAmount).toBe(12500) // 500 * 25
    })

    it('should not create transaction without authentication', async () => {
      const transactionData = {
        batchId: 'BATCH_001',
        to: distributorId,
        type: 'sale',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 25
      }

      await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(401)
    })

    it('should not create transaction with insufficient quantity', async () => {
      const transactionData = {
        batchId: 'BATCH_001',
        to: distributorId,
        type: 'sale',
        quantity: 1500, // More than available
        unit: 'kg',
        pricePerUnit: 25
      }

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(400)

      expect(response.body.message).toBe('Insufficient quantity available')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.errors).toBeDefined()
    })
  })

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create test transaction
      const transaction = new Transaction({
        transactionId: 'TXN_001',
        batch: batchId,
        from: farmerId,
        to: distributorId,
        type: 'sale',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 25,
        totalAmount: 12500,
        status: 'completed'
      })
      await transaction.save()
    })

    it('should get all transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.transactions).toHaveLength(1)
      expect(response.body.pagination).toBeDefined()
    })

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=sale')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.transactions).toHaveLength(1)
      expect(response.body.transactions[0].type).toBe('sale')
    })
  })
})


