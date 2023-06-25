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
        return res.json(allEmployee)
    } catch (error) {
        res.status(409);//conflict
        return res.json(error);
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
            res.status(409);//conflict
            return res.json({ "message": "Employee does not exist" });
        }
        return res.json(employee);
    }
    catch (error) {
        res.status(409);//conflict
        return res.json(error);
    }
})

// Create a new employee
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { firstName, lastName, age, address } = req.body;
        const user_email = req.user.email;
        // Validate
        const result = employeeSchema.validate({ firstName, lastName, age, address })
        if (result?.error) {
            let err = []
            result.error.details.map((ele) => {
                let key = ele.path[0]
                let value = ele.message
                let e = {}
                e[key] = value
                err.push(e)
            })
            res.status(409);//conflict
            return res.json(err)
        }
        const employee = await db_employee.findOne({
            firstName,
            lastName,
            user_email
        })
        // if employee already exist
        if (employee) {
            res.status(409);//conflict
            return res.json({ "message": "Employee does not exist" });
        }
        // /else
        const new_employee = await db_employee.insert({
            firstName, lastName, age, address, user_email
        })
        return res.status(201).json(new_employee);
    } catch (error) {
        res.status(409);//conflict
        return res.json(error);
    }
})

// update a specific employee
router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, age, address } = req.body;
        const user_email = req.user.email;
        // Validate
        const result = employeeSchema.validate({ firstName, lastName, age, address })
        if (result?.error) {
            let err = []
            result.error.details.map((ele) => {
                let key = ele.path[0]
                let value = ele.message
                let e = {}
                e[key] = value
                err.push(e)
            })
            res.status(409);//conflict
            return res.json(err)
        }
        const employee = await db_employee.findOne({
            _id: id, user_email
        })
        // if employee does not exist
        if (!employee) {
            res.status(409);//conflict
            return res.json({ "message": "Employee does not exist" });
        }
        const updateEmployee = await db_employee.update({
            _id: id, user_email
        },
            {
                $set: { firstName, lastName, age, address }
            },
            {
                upsert: true
            }
        )
        return res.json(updateEmployee)
    }
    catch (error) {
        res.status(409);//conflict
        return res.json(error);
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
        return res.json({
            message: 'Successfully Delete employee'
        })
    }
    catch (error) {
        res.status(409);//conflict
        return res.json(error);
    }
})


module.exports = router;