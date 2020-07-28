const express = require('express');
const ExpressError = require('../helpers/expressError');
const jsonschema = require('jsonschema')
const router = new express.Router()

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

  } catch (error) {
    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    
  } catch (error) {
    return next(error)
  }
})

router.get('/:handle', async (req, res, next) => {
  try {
    
  } catch (error) {
    return next(error)
  }
})

router.patch('/:handle', async (req, res, next) => {
  try {
    
  } catch (error) {
    return next(error)
  }
})

router.delete('/:handle', async (req, res, next) => {
  try {
    
  } catch (error) {
    return next(error)
  }
})