const request = require('supertest')
const app = require('../server')
const User = require('../models/User')

describe('Authentication Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '+91-9876543210'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.message).toBe('User registered successfully')
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(userData.email)
    })

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '+91-9876543210'
      }

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.message).toBe('User already exists with this email')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400)

      expect(response.body.errors).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'farmer',
        phone: '+91-9876543210'
      }

      await request(app)
        .post('/api/auth/register')
        .send(userData)
    })

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.message).toBe('Login successful')
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(loginData.email)
    })

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400)

      expect(response.body.message).toBe('Invalid credentials')
    })
  })
})


