const request = require('supertest');
const app = require('../../app');
const db = require('../../db')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../../config");

beforeAll(async () => {
  await db.query(
    `INSERT INTO companies 
      (handle, name)
    VALUES 
      ('test', 'Test Company'),
      ('test2', 'Test Company 2')
  `)
})

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO jobs 
      (title, salary, equity, company_handle)
    VALUES 
      ('Tester 1', '25000', 0, 'test'),
      ('Tester 2', '50000', 0.25, 'test2'),
      ('Tester 3', '100000', 0.50, 'test')
    RETURNING *`
  )
  
  // Testcompanies with just names and handles defined. 
  testJob1 = { title: result.rows[0].title, company_handle: result.rows[0].company_handle }
  testJob2 = { title: result.rows[1].title, company_handle: result.rows[1].company_handle }
  testJob3 = { title: result.rows[2].title, company_handle: result.rows[2].company_handle }
  
  // Testcompany with all details defined.
  testJob4 = result.rows[0]

  const hashedPassword = await bcrypt.hash("secret", BCRYPT_WORK_FACTOR);
  await db.query(`
  INSERT INTO users 
    (username, password, email, first_name, last_name, is_admin)
  VALUES 
    ('AdminUser', $1, 'admin@user.com', 'Admin', 'User', 'true'),
    ('TestUser', $1, 'test@user.com', 'Test', 'User', 'false')
  RETURNING *`, [hashedPassword])

  const testAdmin = { username: 'AdminUser', is_admin: true }
  const testUser =  { username: 'TestUser', is_admin: false }

  testAdminToken = jwt.sign(testAdmin, SECRET_KEY)
  testUserToken = jwt.sign(testUser, SECRET_KEY)
})

afterEach(async () => {
  await db.query(`DELETE FROM jobs`)
  await db.query(`DELETE FROM users`)
})

afterAll(async () => {
  await db.query(`DELETE FROM companies`)
  await db.end()
})

describe('GET /jobs', () => {
  test('get a list of all companies, no search parameters', async () => {
    const res = await request(app).get('/jobs').send({ _token: testUserToken })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ jobs: [testJob1, testJob2, testJob3] })
  })

  test('get a list of jobs with min_salary and min_equity parameters', async () => {
    const res = await request(app).get('/jobs').send({
      min_salary: 26000,
      min_equity: 0.4,
      _token: testUserToken
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ jobs: [testJob3] })
  })

  test('get a list of jobs mith search string', async () => {
    const res = await request(app).get('/jobs').send({search: 'test2', _token: testUserToken })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ jobs: [testJob2] })
  })

  test('get an empty list of jobs mith search string', async () => {
    const res = await request(app).get('/jobs').send({search: 'NoJob', _token: testUserToken })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ jobs: [] })
  })
})

describe('POST /jobs', () => {
  test('add a new job', async () => {
    const jobTest = {
      title: 'QA Tester', 
      salary: 99999, 
      equity: 0.99,
      company_handle: 'test',
      _token: testAdminToken
    }
    const res = await request(app).post('/jobs').send(jobTest)

    // Set id and date_posted
    console.log("BODY", res.body)
    jobTest.id = res.body.job.id
    jobTest.date_posted = res.body.job.date_posted
    expect(res.statusCode).toBe(200)
    expect(res.body.job).toHaveProperty('salary', jobTest.salary)

    // Make sure job was created
    const getJobRes = await request(app).get(`/jobs/${jobTest.id}`).send({ _token: testUserToken })
    expect(getJobRes.body.job).toHaveProperty('title', jobTest.title)
  })
})
  test('returns 400 with invalid input', async () => {
    const res = await request(app).post('/jobs').send({
      title: '123', 
      salary: 'high', 
      equity: 'please', 
      company_handle: 'test',
      _token: testAdminToken
    })
    expect(res.statusCode).toBe(400)
  })

describe('GET /jobs/:id', () => {
  test('gets a single job', async () => {
    const res = await request(app).get(`/jobs/${testJob4.id}`).send({ _token: testUserToken })
    expect(res.statusCode).toBe(200)
    expect(res.body.job).toHaveProperty('id', testJob4.id)
  })
  test('returns 404 for invalid id ', async () => {
    const res = await request(app).get('/jobs/0').send({ _token: testUserToken })
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find job with id 0")
  })
})

describe('PATCH /jobs/:id', () => {
  test('updates a single job', async () => {
    // Update testJob4 data with this:
    const updateData = {
      title: 'A new job title', 
      salary: 500, 
      equity: 0.33,
      company_handle: 'test',
      _token: testAdminToken 
    }

    // Send update request
    const res = await request(app).patch(`/jobs/${testJob4.id}`).send(updateData)
    expect(res.statusCode).toBe(200)
    expect(res.body.job).toHaveProperty('title', updateData.title)

    // Check updated company data
    const getJobRes = await request(app).get(`/jobs/${testJob4.id}`).send({ _token: testUserToken })
    expect(getJobRes.body.job).toHaveProperty('title', 'A new job title')
  })

  test('returns 404 for invalid id', async () => {
    const res = await request(app).patch('/jobs/0').send({
      title: 'A title', 
      salary: 230, 
      equity: 0, 
      company_handle: 'test',
      _token: testAdminToken
    })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find job with id 0")
  })
})

describe('DELETE /jobs/:id', () => {
  test('Deletes a single job', async () => {
    const res = await request(app).delete(`/jobs/${testJob4.id}`).send({ _token: testAdminToken })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'Job deleted' })

    // Make sure company is deleted:
    const getJobRes = await request(app).get(`/jobs/${testJob4.id}`).send({ _token: testUserToken })
    expect(getJobRes.statusCode).toEqual(404)
  })
  test('responds with 404 for invalid id', async () => {
    const res = await request(app).delete('/jobs/0').send({ _token: testAdminToken })
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find job with id 0")
  })
})
  