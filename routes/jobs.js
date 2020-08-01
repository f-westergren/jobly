const express = require('express');
const Job = require('../models/job')
const router = new express.Router()
const ExpressError = require('../helpers/expressError');
const { validate } = require('jsonschema');
const jobNew = require('../schemas/jobNew.json');
const jobUpdate = require('../schemas/jobUpdate.json');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/authenticate')

/** GET /, returns name and handle for all job objects.
 * Ordered by most recently posted jobs
 * The following query strings are accepted:
 *  search
 *  min_salary
 *  min_equity
 * 
 *  => { jobs: [job, ...] }
 * 
 */

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const {search, min_salary, min_equity} = req.body;

    const jobs = await Job.findAll(search, min_salary, min_equity)
    return res.json({ jobs: jobs })
  } catch (error) {
    return next(error)
  }
})

/** Create a new job and return {job: jobData}. */
router.post('/', ensureAdmin, async (req, res, next) => {
  try {
    // Schema validation
    const validation = validate(req.body, jobNew)
    if (!validation.valid) {
      // pass validation errors to error handler
      let error = new ExpressError(validation.errors.map(error => error.stack), 400)
      return next(error)
    }  
    const jobData = await Job.add(req.body)
    return res.send({ job: jobData })
  } catch (error) {
    return next(error)
  }
})

/** Return a single job by its id. {job: jobData}. */
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const jobData = await Job.findOne(req.params.id)

    return res.send({ job: jobData })
  } catch (error) {
    return next(error)
  }
})

/** Update an existing job and return the updated job. {job: updatedData} */
router.patch('/:id', ensureAdmin, async (req, res, next) => {  
  try {
    // Schema validation
    const validation = validate(req.body, jobUpdate)
    if (!validation.valid) {
      // pass validation errors to error handler
      let error = new ExpressError(validation.errors.map(error => error.stack), 400)
      return next(error)
    }
    let jobData = await Job.update(req.params.id, req.body)

    return res.send({ job: jobData })
  } catch (error) {
    return next(error)
  }
})

/** Delete an existing job and return a message. {message: "Job deleted"} */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
  try {
    let job = await Job.findOne(req.params.id)
    await job.remove();
    return res.json({ message: "Job deleted" })
  } catch (error) {
    return next(error)
  }
})

module.exports = router