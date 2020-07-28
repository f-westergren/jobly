const express = require('express');
const ExpressError = require('../helpers/expressError');
const Company = require('../models/company')
const router = new express.Router()
const checkCompanySchema = require('../middleware/companySchema')

/** GET /, returns name and handle for all company objects.
 * The following query strings are accepted:
 *  search
 *  min_employees
 *  max_employees
 * 
 *  => { companies: [companyData, ...] }
 * 
 */

router.get('/', async (req, res, next) => {
  try {
    const {search, minEmployees, maxEmployees} = req.body;

    const companies = await Company.findAll(search, minEmployees, maxEmployees)
    return res.json({companies: companies})
  } catch (error) {
    return next(error)
  }
})

router.post('/', checkCompanySchema, async (req, res, next) => {
  try {
    const {handle, name, num_employees, description, logo_url } = req.body
    const company = await Company.add(handle, name, num_employees, description, logo_url)

    return res.send(company)
  } catch (error) {
    return next(error)
  }
})

router.get('/:handle', async (req, res, next) => {
  try {
    const company = await Company.findOne(req.body.handle)

    return res.send(company)
  } catch (error) {
    return next(error)
  }
})

router.patch('/:handle', checkCompanySchema, async (req, res, next) => {
  try {
    let company = await Company.update(req.params.handle, req.body)

    return res.send(company)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:handle', async (req, res, next) => {
  try {
    let company = await Company.findOne(req.params.handle)
    await company.remove();
    return res.json({message: "Company deleted"})
  } catch (error) {
    return next(error)
  }
})

module.exports = router