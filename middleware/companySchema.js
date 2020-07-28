const jsonschema = require('jsonschema');
const ExpressError = require('../helpers/expressError')
const companySchema = require('../schemas/companySchema.json')

const checkCompanySchema = (req, res, next) => {
    const result = jsonschema.validate(req.body, companySchema)

    if (!result.valid) {
      const listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400)
    }
    return next()
}

module.exports = checkCompanySchema