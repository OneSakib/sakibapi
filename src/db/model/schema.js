const Joi = require('joi')

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().min(5).max(40).required().email(),
    password: Joi.string().min(5).max(16).required(),
    token: Joi.string()
})

const employeeSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30),
    age: Joi.number().required(),
    address: Joi.string().min(6).required(),
    user_email: Joi.string().email()
})

module.exports = { userSchema, employeeSchema }