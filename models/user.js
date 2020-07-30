const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate')
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** Collection of related methods for jobs */

class User {
  constructor({ username, first_name, last_name, email, photo_url, is_admin }) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin;
  }

  // Find all users
  static async findAll() {
    const result = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    )
    return result.rows.map(u => new User(u))
  }

    // Add new user
  static async add(userData) {
    const { username, password, first_name, last_name, email, photo_url } = userData

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, photo_url`, 
      [username, hashedPassword, first_name, last_name, email, photo_url]
    )
    if (result.rows.length === 0) {
      throw new ExpressError("Couldn't add user", 400)
    }
    let user = new User(result.rows[0])
    user.password = hashedPassword

    return user
  }

  // Find one user by username.
  static async findOne(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users WHERE username=$1`, [username]
    )
    if (result.rows.length === 0) {
      throw new ExpressError(`Couldn't find user with username ${username}`, 404)
    }
    return new User(result.rows[0])
  }

  // Update user.
  static async update(username, items) {
    const queryObj = sqlForPartialUpdate('users', items, 'username', username)
    const result = await db.query(queryObj.query, queryObj.values)
    if (result.rows.length === 0) {
      throw new ExpressError(`Couldn't find user with username ${username}`, 404)
    }
    return new User(result.rows[0])
  }

    // Delete user
    async remove() {
      await db.query(
        `DELETE FROM users WHERE username = $1`, [this.username]
      );
    }
}

module.exports = User