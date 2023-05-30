const Joi = require('joi')

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().min(5).max(40).required(),
    password: Joi.string().min(5).max(16).required(),
    token: Joi.string()
})

const postSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    model: Joi.string().min(3).max(30).required(),
    price: Joi.number().required()
})

module.exports = { userSchema, postSchema }