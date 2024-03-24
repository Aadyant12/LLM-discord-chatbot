const request = require('supertest');
const app = require('../backend/app');
const mongoose = require("mongoose");

describe('Message Controller Tests', () => {
  let authToken;
  let mockChatId;
  const mockUser = {
    name: 'TestUser',
    email: 'testuser@example.com',
    password: 'testpassword',
  }; 

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(200);

    authToken = response.body.token;

    const chatResponse = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: '656ff00d9022b99f5e2b2de5' })
      .expect(200);

    mockChatId = chatResponse.body._id;
  });

  it('should get all messages for a chat', async () => {
    const response = await request(app)
      .get(`/api/message/${mockChatId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should send a new message', async () => {
    const response = await request(app)
      .post('/api/message')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Test Message',
        toxicClass: 0,
        chatId: mockChatId,
      })
      .expect(200);

    expect(response.body).toHaveProperty('content');
    expect(response.body).toHaveProperty('toxicClass');
    expect(response.body).toHaveProperty('sender');
    expect(response.body).toHaveProperty('chat');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  })

});
