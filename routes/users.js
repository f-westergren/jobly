const express = require('express');
const User = require('../models/user')
const router = new express.Router()
const { validate } = require('jsonschema');
const userNew = require('../schemas/userNew.json');
const userUpdate = require('../schemas/userUpdate.json');
const ExpressError = require("../helpers/expressError");
const login = require('../models/auth')
const { ensureSameUser } = require('../middleware/authenticate')


/** Returns the username, first_name, last_name and email of the user objects. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll()
    return res.json({ users: users })
  } catch (error) {
    return next(error)
  }
})

/** Create a new user and return JWT with username and is_admin {token: token}. */
router.post('/', async (req, res, next) => {
  try {
    // Schema validation
    const validation = validate(req.body, userNew)
    if (!validation.valid) {
      // pass validation errors to error handler
      let error = new ExpressError(validation.errors.map(error => error.stack), 400)
      return next(error)
    }
    await User.add(req.body)
    const token = await login(req.body.username, req.body.password)
    return res.send({ token: token })
  } catch (error) {
    return next(error)
  }
})

/** Return a single user by its username. {user: userData}. */
router.get('/:username', async (req, res, next) => {
  try {
    const userData = await User.findOne(req.params.username)

    return res.send({ user: userData })
  } catch (error) {
    return next(error)
  }
})

/** Update an existing user and return the updated user details. {job: updatedData} */
router.patch('/:username', ensureSameUser, async (req, res, next) => {
  try {
    // Schema validation
    const validation = validate(req.body, userUpdate)
    if (!validation.valid) {
      // pass validation errors to error handler
      let error = new ExpressError(validation.errors.map(error => error.stack), 400)
      return next(error)
    }
    let userData = await User.update(req.params.username, req.body)

    return res.send({ user: userData })
  } catch (error) {
    return next(error)
  }
})

/** Delete an existing job and return a message. {message: "Job deleted"} */
router.delete('/:username', ensureSameUser, async (req, res, next) => {
  try {
    let user = await User.findOne(req.params.username)
    await user.remove();
    return res.json({ message: "User deleted" })
  } catch (error) {
    return next(error)
  }
})

module.exports = router