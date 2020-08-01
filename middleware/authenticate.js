const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Auth JWT token, add auth'd user (if any) to req. */
const authenticateJWT = (req, res, next) => {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload;
    return next()
  } catch (error) {
    // error in this middleware isn't error
    return next();
  }
}

// Require user or raise 401 error
const ensureLoggedIn = (req, res, next) => {
  if (!req.user) {
    const error = new ExpressError('Unathorized', 401)
    return next(error);
  } else {
    return next();
  }
}

const ensureAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin ) {
    const error = new ExpressError('Unathorized', 401)
    return next(error);
  } else {
    return next();
  }
}

const ensureSameUser = (req, res, next) => {
  if (!req.user || req.user.username !== req.params.username) {
    const error = new ExpressError('Unathorized', 401)
    return next(error);
  } else {
    return next();
  }
}

module.exports = { authenticateJWT, ensureLoggedIn, ensureAdmin, ensureSameUser }