const express = require('express');
const User = require('../models/user')
const router = new express.Router()
const checkUserSchema = require('../middleware/userSchema')


/** Returns the username, first_name, last_name and email of the user objects. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll()
    return res.json({ users: users })
  } catch (error) {
    return next(error)
  }
})

/** Create a new user and return {user: userData}. */
router.post('/', checkUserSchema, async (req, res, next) => {
  try {
    const userData = await User.add(req.body)
    return res.send({ user: userData })
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
router.patch('/:username', checkUserSchema, async (req, res, next) => {
  try {
    let userData = await User.update(req.params.username, req.body)

    return res.send({ user: userData })
  } catch (error) {
    return next(error)
  }
})

/** Delete an existing job and return a message. {message: "Job deleted"} */
router.delete('/:username', async (req, res, next) => {
  try {
    let user = await User.findOne(req.params.username)
    await user.remove();
    return res.json({ message: "User deleted" })
  } catch (error) {
    return next(error)
  }
})

module.exports = router