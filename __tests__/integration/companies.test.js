const request = require('supertest');
const app = require('../../app');
const db = require('../../db')

let testCompany;

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO companies (handle, name, num_employees, description, logo_url)
    VALUES ('test', 'Test Company', 50, 'A testing company', 'www.test.com'),
    ('test2', 'Test2 Company', 100, 'A testing 2 company', 'www.test2.com'),
    ('test3', 'Test3 Company', 150, 'A testing 3 company', 'www.test3.com')
    RETURNING *`
  )
  
  // Testcompanies with just names and handles defined. 
  testCompany = { handle: result.rows[0].handle, name: result.rows[0].name }
  testCompany2 = { handle: result.rows[1].handle, name: result.rows[1].name }
  testCompany3 = { handle: result.rows[2].handle, name: result.rows[2].name }
  
  // Testcompany with all details defined.
  testCompany4 = result.rows[2]
})


afterEach(async () => {
  await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
  await db.end()
})

describe('GET /companies', () => {
  test('get a list of all companies, no search parameters', async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ companies: [testCompany, testCompany2, testCompany3] })
  })

  test('get a list of companies with min_employees and max_employees parameters', async () => {
    const res = await request(app).get('/companies').send({min_employees: 75, max_employees: 120})
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ companies: [testCompany2] })
  })

  test('get a list of companies mith search string', async () => {
    const res = await request(app).get('/companies').send({search: 'Test2'})
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ companies: [testCompany2] })
  })

  test('get an empty list of companies mith search string', async () => {
    const res = await request(app).get('/companies').send({search: 'NoCompany'})
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ companies: [] })
  })
})

describe('POST /companies', () => {
  test('add a new company', async () => {
    const testly = {
      handle: 'testlify', 
      name: 'Testlify', 
      num_employees: 123, 
      description: 'Testing the test', 
      logo_url: 'www.testly.com'
    }
    const res = await request(app).post('/companies').send(testly)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ company: testly })

    // Make sure company was created
    const getCompanyRes = await request(app).get(`/companies/${testly.handle}`)
    expect(getCompanyRes.body.company).toEqual(testly)
  })

  test('returns 400 with invalid input', async () => {
    const res = await request(app).post('/companies').send({handle: 123, name: 123})
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      "message": 
        [
          "instance.handle is not of a type(s) string", 
          "instance.name is not of a type(s) string"
        ], 
      "status": 400
    })
  })

  test('returns 400 without input', async () => {
    const res = await request(app).post('/companies')
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      "message": 
        [
          "instance requires property \"handle\"", 
          "instance requires property \"name\""
        ], 
      "status": 400
    })    
  })
})

describe('GET /companies/:handle', () => {
  test('gets a single company', async () => {
    const res = await request(app).get(`/companies/${testCompany4.handle}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ company: testCompany4 })
  })
  test('returns 404 for invalid handle ', async () => {
    const res = await request(app).get('/companies/invalidHandle')
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find company with handle invalidHandle")
  })
})

describe('PATCH /companies/:handle', () => {
  test('updates a single company', async () => {
    // Update testCompany data with this:
    const updateData = {
      handle: testCompany.handle, 
      name: testCompany.name, 
      num_employees: 500, 
      description: 'Update test', 
      logo_url: 'www.updatedurl.com'
    }

    // Send update request
    const res = await request(app).patch(`/companies/${testCompany.handle}`).send(updateData)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ company: updateData })

    // Check updated company data
    const getCompanyRes = await request(app).get(`/companies/${testCompany.handle}`)
    expect(getCompanyRes.body.company).toEqual(updateData)
  })

  test('returns 404 for invalid handle ', async () => {
    const res = await request(app).patch('/companies/invalidHandle').send({handle: 'invalidHandle', name: 'Invalid'})
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toEqual("Couldn't find company with handle invalidHandle")
  })
})

describe('DELETE /companies/:handle', () => {
  test('Deletes a single company', async () => {
    const res = await request(app).delete(`/companies/${testCompany.handle}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'Company deleted' })

    // Make sure company is deleted:
    const getCompanyRes = await request(app).get(`/companies/${testCompany.handle}`)
    expect(getCompanyRes.statusCode).toEqual(404)
  })
  test('responds with 404 for invalid handle', async () => {
    const res = await request(app).delete('/companies/invalidHandle')
    expect(res.statusCode).toBe(404)
  })
})
  