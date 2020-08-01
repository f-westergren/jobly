const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate')

/** Collection of related methods for jobs */

class Job {
  constructor({ id, title, salary, equity, company_handle, date_posted }) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  // Find all jobs, optional search parameters: search query, min_employees, max_employees
  // Default values set in case parameters are not passed to avoid lots of logic.
  static async findAll(search='', min_salary=0, min_equity=-1) {

    const result = await db.query(
      `SELECT * 
      FROM jobs
      WHERE company_handle ILIKE $1
      AND salary > $2 
      AND equity > $3
      ORDER BY date_posted
      `, [`%${search}%`, min_salary, min_equity]  // Add % % aroud search to make string match parts of company name
    )
    return result.rows.map(j => new Job({ title: j.title, company_handle: j.company_handle }))
  }

    // Add new job
  static async add(jobData) {
    const { title, salary, equity, company_handle } = jobData
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING *`, [title, salary, equity, company_handle]
    )
    if (result.rows.length === 0) {
      throw new ExpressError("Couldn't add job", 400)
    }
    return new Job(result.rows[0])
  }

  // Find one job by id.
  static async findOne(id) {
    const result = await db.query(
      `SELECT * FROM jobs WHERE id=$1`, [id]
    )
    if (result.rows.length === 0) {
      throw new ExpressError(`Couldn't find job with id ${id}`, 404)
    }
    return new Job(result.rows[0])
  }

  // Update job.
  static async update(id, items) {
    const queryObj = sqlForPartialUpdate('jobs', items, 'id', id)
    const result = await db.query(queryObj.query, queryObj.values)
    if (result.rows.length === 0) {
      throw new ExpressError(`Couldn't find job with id ${id}`, 404)
    }
    return new Job(result.rows[0])
  }

    // Delete job
    async remove() {
      await db.query(
        `DELETE FROM jobs WHERE id = $1`, [this.id]
      );
    }
}

module.exports = Job