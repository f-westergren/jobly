const express = require('express');
const Company = require('../models/company');
const router = new express.Router();
const { validate } = require('jsonschema');
const companyNew = require('../schemas/companyNew.json');
const companyUpdate = require('../schemas/companyUpdate.json');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/authenticate');
const ExpressError = require('../helpers/ExpressError');

/** GET /, returns name and handle for all company objects.
 * The following query strings are accepted:
 *  search
 *  min_employees
 *  max_employees
 * 
 *  => { companies: [companyData, ...] }
 * 
 */

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const {search, min_employees, max_employees} = req.body;

    const companies = await Company.findAll(search, min_employees, max_employees)
    return res.json({ companies: companies })
  } catch (error) {
    return next(error)
  }
})

/** Create a new company and return {company: companyData}. */
router.post('/', ensureAdmin, async (req, res, next) => {
  try {
    // Schema validation
    const validation = validate(req.body, companyNew)
    if (!validation.valid) {
      // pass validation errors to error handler
      let error = new ExpressError(validation.errors.map(error => error.stack), 400)
      return next(error)
    }
  
    const {handle, name, num_employees, description, logo_url } = req.body
    const company = await Company.add(handle, name, num_employees, description, logo_url)

    return res.send({ company: company })
  } catch (error) {
    return next(error)
  }
})

/** Return a single company by its handle. {company: companyData}. */
router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
  try {
    const company = await Company.findOne(req.params.handle)

    return res.send({ company: company })
  } catch (error) {
    return next(error)
  }
})

/** Update an existing company and return the updated company. {company: companyData} */
router.patch('/:handle', ensureAdmin, async (req, res, next) => {
  try {
    // Schema validation
    const validation = validate(req.body, companyUpdate)
    if (!validation.valid) {
      // pass validation errors to error handler
      let error = new ExpressError(validation.errors.map(error => error.stack), 400)
      return next(error)
    }    
    let company = await Company.update(req.params.handle, req.body)

    return res.send({ company: company })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:handle', ensureAdmin, async (req, res, next) => {
  try {
    let company = await Company.findOne(req.params.handle)
    await company.remove();
    return res.json({message: "Company deleted"})
  } catch (error) {
    return next(error)
  }
})

module.exports = router