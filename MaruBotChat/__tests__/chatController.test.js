const request = require('supertest');
const app = require('../backend/app');
const mongoose = require("mongoose");

describe('Chat Controller Tests', () => {
  let authToken;
  let mockUserId;

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
    mockUserId = response.body._id;
  });

  it('should create or fetch one-to-one chat', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: '6563cacbfccdbdc250e46c50' })
      .expect(200);

    expect(response.body).toHaveProperty('chatName');
    expect(response.body).toHaveProperty('users');
  });

  it('should fetch all chats for a user', async () => {
    const response = await request(app)
      .get('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should not create a new group chat with less than 2 users', async () => {
    const response = await request(app)
      .post('/api/chat/group')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'TestGroup', users: JSON.stringify(["6564aaf9aa63d8ee60ff9253"]) })
      .expect(400);
  });

  it('should rename a group', async () => {
    const response = await request(app)
      .put('/api/chat/rename')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ chatId: "656ffc219022b99f5e2b2de6", chatName: 'NewGroupName' })
      .expect(200);

    expect(response.body).toHaveProperty('chatName', 'NewGroupName');
  });

  it('should add user to a group', async () => {
    const response = await request(app)
      .put('/api/chat/groupadd')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ chatId: "656ffc219022b99f5e2b2de6", userId: '6563cacbfccdbdc250e46c4f' })
      .expect(200);

  expect(Array.isArray(response.body.users)).toBe(true);

  const userWithId = response.body.users.find(user => user._id === '6563cacbfccdbdc250e46c4f');
  expect(userWithId).toBeDefined();
    
  });

  it('should remove user from a group', async () => {
    const response = await request(app)
      .put('/api/chat/groupremove')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ chatId: "656ffc219022b99f5e2b2de6", userId: '6563cacbfccdbdc250e46c4f' })
      .expect(200);

    expect(response.body.users).not.toContain('6563cacbfccdbdc250e46c4f');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  })

});
