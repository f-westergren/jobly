const request = require('supertest');
const app = require('../../app');
const db = require('../../db')

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO users 
      (username, password, first_name, last_name, email, photo_url)
    VALUES 
      ('TestUser', 'password', 'Test', 'User', 'user@test.com', 'www.test.com')
    RETURNING *`
  )

  testUser = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM users`)
})

afterAll(async () => {
  await db.end()
})

describe('GET /users', () => {
  test('get a list of all users', async () => {
    const res = await request(app).get('/users')
    expect(res.statusCode).toBe(200)
    expect(res.body.users).toHaveLength(1)
    expect(res.body.users[0]).toHaveProperty("username", "TestUser")
  })
})

describe('POST /users', () => {
  test('add a new user', async () => {
    const userTest = {
      username: 'test',
      password: 'password',
      first_name: 'First',
      last_name: 'Last',
      email: 'test@user.com'
    }
    const res = await request(app).post('/users').send(userTest)

    expect(res.statusCode).toBe(200)
    // Make sure password has been hashed
    expect(res.body.user.password).not.toEqual('password')
    expect(res.body.user).toHaveProperty('username', userTest.username)
    expect(res.body.user).toHaveProperty('email', userTest.email)

    // Make sure user was created
    const getUserRes = await request(app).get(`/users/${userTest.username}`)
    expect(getUserRes.body.user).toHaveProperty('username', userTest.username)
  })
})
  test('returns 400 with invalid input', async () => {
    const res = await request(app).post('/users').send({
      username: 123,
      password: 123,
      first_name: 123,
      last_name: 123
    })
  expect(res.statusCode).toBe(400)
})

describe('GET /users/:username', () => {
  test('gets a single user', async () => {
    const res = await request(app).get(`/users/${testUser.username}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.user).toHaveProperty('username', testUser.username)
    expect(res.body.user).toHaveProperty('email', testUser.email)
  })
  test('returns 404 for invalid id ', async () => {
    const res = await request(app).get('/users/noUser')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find user with username noUser")
  })
})

describe('PATCH /users/:username', () => {
  test('updates a single username', async () => {
    // Update testUser with this:
    const updateData = {
      username: testUser.username,
      password: 'password',
      first_name: 'First',
      last_name: 'Updated',
      email: 'test@user.com'
    }

    // Send update request
    const res = await request(app).patch(`/users/${testUser.username}`).send(updateData)
    expect(res.statusCode).toBe(200)
    expect(res.body.user).toHaveProperty('first_name', 'First')
    expect(res.body.user).toHaveProperty('email', 'test@user.com')

    // Check updated company data
    const getUserRes = await request(app).get(`/users/${testUser.username}`)
    expect(getUserRes.body.user).toHaveProperty('last_name', 'Updated')
  })

  test('returns 404 for invalid id', async () => {
    const res = await request(app).patch('/users/noUser').send({
      username: 'user',
      password: 'password',
      first_name: 'First',
      last_name: 'Updated',
      email: 'test@user.com'
    })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toContain("Couldn't find user with username noUser")
  })
})

describe('DELETE /users/:id', () => {
  test('Deletes a single user', async () => {
    const res = await request(app).delete(`/users/${testUser.username}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'User deleted' })

    // Make sure user is deleted:
    const getUserRes = await request(app).get(`/users/${testUser.username}`)
    expect(getUserRes.statusCode).toEqual(404)
  })
  test('responds with 404 for invalid id', async () => {
    const res = await request(app).delete('/users/noUser')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find user with username noUser")
  })
})
  