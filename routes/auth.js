const express = require("express");
const router = new express.Router();
const User = require("../models/User");

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const token = await User.authenticate(username, password)
    return res.json({ token: token })
  } catch (error) {
    return next(error)
  }

})

module.exports = router