const jsonschema = require('jsonschema');
const ExpressError = require('../helpers/expressError')
const jobSchema = require('../schemas/jobSchema.json')

const checkJobSchema = (req, res, next) => {
    const result = jsonschema.validate(req.body, jobSchema)

    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400)
    }
    return next()
}

module.exports = checkJobSchema