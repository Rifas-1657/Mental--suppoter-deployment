const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')
const User = require('../models/User')

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test')
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          alias: 'testuser'
        })

      expect(res.statusCode).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.user).toHaveProperty('email', 'test@example.com')
      expect(res.body.user).toHaveProperty('alias', 'testuser')
      expect(res.body).toHaveProperty('token')
    })

    it('should not register user with existing email', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        alias: 'existinguser'
      })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          alias: 'newuser'
        })

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toContain('User already exists')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        alias: 'testuser'
      })
    })

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('email', 'test@example.com')
    })

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })

      expect(res.statusCode).toBe(401)
      expect(res.body.error).toContain('Invalid credentials')
    })
  })
})
