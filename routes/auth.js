const express = require("express");
const router = new express.Router();
const login = require('../models/auth')

// const {ensureLoggedIn, ensureAdmin} = require("../middleware/auth");

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const token = await login(username, password)
    return res.json({ token: token })
  } catch (error) {
    return next(error)
  }

})

module.exports = router