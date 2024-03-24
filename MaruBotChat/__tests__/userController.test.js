const request = require('supertest');
const app = require('../backend/app'); // Import your Express app
// const { User } = require('../models'); // Import your User model
const mongoose = require("mongoose");


describe('User Controller Tests', () => {
  // Assuming you have a working Express app and database connection

  // Mock user data for testing
  const mockUser = {
    name: 'TestUser',
    email: 'testuser@example.com',
    password: 'testpassword',
  };

  let authToken;
  let server;
  
  beforeAll(async () => {
    // server = app.listen(3001);
    await request(app)
      .post('/api/user')
      .send(mockUser)
      .expect(400);
  });

  it('should not register a user with missing fields', async () => {
    const response = await request(app)
      .post('/api/user')
      .send({ name: 'MissingFieldsUser' })
      .expect(400);

    expect(response.body).toHaveProperty("message", "Please Enter all the Feilds",);
  });

  it('should not register a duplicate user', async () => {
    const response = await request(app)
      .post('/api/user')
      .send(mockUser)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'User already exists');
  });

  it('should authenticate a user', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(200);

    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('name', mockUser.name);
    expect(response.body).toHaveProperty('email', mockUser.email);
    expect(response.body).toHaveProperty('token');
  });

  it('should not authenticate a user with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: "ksh@gmail.com", password: 'Demo@12' })
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Invalid Email or Password');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  })

});
