const request = require('supertest')
const app = require('../server')
const User = require('../models/User')
const ProduceBatch = require('../models/ProduceBatch')

describe('Batch Routes', () => {
  let authToken
  let farmerId

  beforeEach(async () => {
    await User.deleteMany({})
    await ProduceBatch.deleteMany({})

    // Create a farmer user
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

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'farmer@test.com',
        password: 'password123'
      })

    authToken = loginResponse.body.token
  })

  describe('POST /api/batches', () => {
    it('should create a new batch successfully', async () => {
      const batchData = {
        crop: 'wheat',
        variety: 'Durum',
        quantity: 1000,
        unit: 'kg',
        expectedPrice: 25,
        harvestDate: '2023-10-15',
        origin: {
          coordinates: [75.8577, 30.7333],
          address: {
            street: 'Test Farm',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456'
          }
        }
      }

      const response = await request(app)
        .post('/api/batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(batchData)
        .expect(201)

      expect(response.body.message).toBe('Batch created successfully')
      expect(response.body.batch.crop).toBe(batchData.crop)
      expect(response.body.batch.farmer.toString()).toBe(farmerId.toString())
    })

    it('should not create batch without authentication', async () => {
      const batchData = {
        crop: 'wheat',
        variety: 'Durum',
        quantity: 1000,
        unit: 'kg',
        expectedPrice: 25,
        harvestDate: '2023-10-15'
      }

      await request(app)
        .post('/api/batches')
        .send(batchData)
        .expect(401)
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.errors).toBeDefined()
    })
  })

  describe('GET /api/batches', () => {
    beforeEach(async () => {
      // Create test batches
      const batch1 = new ProduceBatch({
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
        }
      })
      await batch1.save()

      const batch2 = new ProduceBatch({
        batchId: 'BATCH_002',
        farmer: farmerId,
        crop: 'rice',
        variety: 'Basmati',
        quantity: 800,
        unit: 'kg',
        expectedPrice: 45,
        harvestDate: new Date('2023-10-20'),
        origin: {
          type: 'Point',
          coordinates: [77.1025, 28.7041]
        }
      })
      await batch2.save()
    })

    it('should get all batches', async () => {
      const response = await request(app)
        .get('/api/batches')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.batches).toHaveLength(2)
      expect(response.body.pagination).toBeDefined()
    })

    it('should filter batches by crop', async () => {
      const response = await request(app)
        .get('/api/batches?crop=wheat')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.batches).toHaveLength(1)
      expect(response.body.batches[0].crop).toBe('wheat')
    })
  })
})


