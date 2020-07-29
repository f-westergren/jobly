const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate')

/** Collection of related methods for companies */

class Company {
  constructor({handle, name, num_employees, description, logo_url}) {
    this.handle = handle;
    this.name = name;
    this.num_employees=num_employees;
    this.description=description;
    this.logo_url=logo_url;
  }

  // Find all companies, optional search parameters: search query, min_employees, max_employees
  // Default values set in case parameters are not passed to avoid lots of logic.
  static async findAll(search='', min_employees=0, max_employees=999999) {
    // TODO: FIX search
    if (min_employees > max_employees) {
      throw new ExpressError('Incorrect parameters', 400)
    }

    const result = await db.query(
      `SELECT * 
      FROM companies
      WHERE name ILIKE '${search}%'
      AND num_employees > $1 
      AND num_employees < $2
      ORDER BY name
      `, [min_employees, max_employees]
    )
    return result.rows.map(c => new Company({ handle: c.handle, name: c.name }))
  }

  // Add new company
  static async add(handle, name, num_employees, description, logo_url) {
    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`, [handle, name, num_employees, description, logo_url]
    )
    if (result.rows.length === 0) {
      throw new ExpressError("Couldn't add company", 400)
    }
    return new Company(result.rows[0])
  }

  // Find one company by handle.
  static async findOne(handle) {
    const result = await db.query(
      `SELECT * FROM companies WHERE handle=$1`, [handle]
    )
    if (result.rows.length === 0) {
      throw new ExpressError(`Couldn't find company with handle ${handle}`, 404)
    }
    return new Company(result.rows[0])
  }

  // Update company.
  static async update(handle, items) {
    const queryObj = sqlForPartialUpdate('companies', items, 'handle', handle)
    const result = await db.query(queryObj.query, queryObj.values)
    if (result.rows.length === 0) {
      throw new ExpressError(`Couldn't find company with handle ${handle}`, 404)
    }
    return new Company(result.rows[0])
  }

  // Delete company
  async remove() {
    await db.query(
      `DELETE FROM companies WHERE handle = $1`, [this.handle]
    );
  }
}

module.exports = Company;