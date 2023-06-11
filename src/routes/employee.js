const express = require('express');
const { employeeSchema } = require('../db/model/schema');
const db = require('../db/connection');
const db_employee = db.get('employee');
const { verifyToken } = require('../middleware/auth')

const router = express.Router();



// API Endpoints
// get all employee
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const user_email = req.user.email;
        const allEmployee = await db_employee.find({ user_email });
        res.json(allEmployee)
    } catch (error) {
        next(error)
    }
})

// get a specific employee
router.get('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_email = req.user.email;
        const employee = await db_employee.findOne({
            _id: id, user_email
        })
        if (!employee) {
            const error = new Error('Employee does not exist');
            return next(error)
        }
        res.json(employee);
    }
    catch (error) {
        next(error)
    }
})

// Create a new employee
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { firstName, lastName, age, address } = req.body;
        const user_email = req.user.email;
        const result = await employeeSchema.validateAsync({ firstName, lastName, age, address })
        const employee = await db_employee.findOne({
            "firstName": firstName,
            "lastName": lastName
        })
        // if employee already exist
        if (employee) {
            res.status(409);//conflict
            const error = new Error('Employee already exist');
            return next(error)
        }
        // /else
        const new_employee = await db_employee.insert({
            firstName, lastName, age, address, user_email
        })
        console.log('Employee has been created');
        res.status(201).json(new_employee);
    } catch (error) {
        next(error)
    }
})

// update a specific employee
router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, age, address } = req.body;
        const user_email = req.user.email;
        const result = await employeeSchema.validateAsync({ firstName, lastName, age, address });
        const employee = await db_employee.findOne({
            _id: id, user_email
        })
        // if employee does not exist
        if (!employee) {
            return next();
        }
        const updateEmployee = await db_employee.update({
            _id: id, user_email
        },
            {
                $set: result
            },
            {
                upsert: true
            }
        )
        res.json(updateEmployee)
    }
    catch (err) {
        next(err)
    }
})

// Delete specific employee
router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_email = req.user.email;
        const employee = await db_employee.findOne({
            _id: id, user_email
        })
        // employee does not exist
        if (!employee) {
            next();
        }
        await db_employee.remove({
            _id: id, user_email
        })
        res.json({
            message: 'Successfully Delete employee'
        })
    }
    catch (err) {
        next(err)
    }
})


module.exports = router;