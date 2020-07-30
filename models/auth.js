const db = require('../db');
const ExpressError = require('../helpers/expressError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config')

const login = async (username, password) => {
  const result = await db.query(
    'SELECT password, is_admin FROM users WHERE username = $1',
    [username]);
  
  let user = result.rows[0]
  console.log(user)

  if (user) {
    if (await bcrypt.compare(password, user.password) === true) {
      let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
      console.log('TOKEN', token)
      return token
      
    }
  }
  throw new ExpressError('Invalid user/password', 400)
}

module.exports = login;