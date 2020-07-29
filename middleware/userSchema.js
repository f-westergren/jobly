const jsonschema = require('jsonschema');
const ExpressError = require('../helpers/expressError')
const userSchema = require('../schemas/userSchema.json')

const checkUserSchema = (req, res, next) => {
    const result = jsonschema.validate(req.body, userSchema)

    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400)
    }
    return next()
}

module.exports = checkUserSchema