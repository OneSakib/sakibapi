const express = require('express');
const { userSchema } = require('../db/model/schema');
const db = require('../db/connection');
const db_user = db.get('user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const router = express.Router();
const helper = require('../helper');
const e = require('express');
const { verifyToken } = require('../middleware/auth')

// API Endpoints
// get all user
router.get('/users', verifyToken, async (req, res, next) => {
    try {
        const allUser = await db_user.find({});
        res.json(allUser)
    } catch (error) {
        next(error)
    }
})

// get a specific post
router.post('/login/', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate
        const result = userSchema.validate({ email, password })
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
            res.json(err)
            return
        }
        const user = await db_user.findOne({
            email: email
        })
        if (!user) {
            const error = new Error('User does not exist');
            return next(error)
        }
        if (user && (await bcrypt.compare(password, user.password))) {
            console.log("CALLED INNER")
            // Create Token
            const token = jwt.sign({
                user_id: user.id, "email": email.toLowerCase()
            },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '2h'
                }
            )
            console.log("CALLLED TOKEN", token)
            // Save user token
            user.token = token;
            const response = { 'email': email, 'name': user.name, "token": user.token }
            console.log("TOKEN", response)
            res.json(response);
        }
        else {
            res.status = 409;
            res.json({ "message": "Authorization Failed" });
        }

    }
    catch (error) {
        next(error)
    }
})

// Create a new post
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = userSchema.validate({ name, email, password })
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
            res.json(err)
            return
        }
        const user = await db_user.findOne({
            email
        })
        // if post already exist
        if (user) {
            res.status(409);//conflict
            const error = new Error('Email already exist');
            return next(error)
        }

        const encrypted_password = await bcrypt.hash(password, 10);

        // /else
        const new_user = await db_user.insert({
            name,
            'email': email.toLowerCase(),
            'password': encrypted_password
        })


        // Create JWT TOKEN
        const token = jwt.sign({
            user_id: new_user.id, email
        },
            process.env.TOKEN_KEY, {
            expiresIn: '2h'
        }
        );

        new_user.token = token;
        const response = { 'name': name, 'email': email.toLowerCase(), 'password': password, 'token': token }
        res.status(201).json(response);
    } catch (error) {
        next(error)
    }
})

// update a specific post
router.put('/user/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        // const result = await userSchema.validateAsync({ name, email, password });
        const validate = helper.validate({ name, email, password })
        if (validate.length > 0) {
            res.send(validate)
        }
        const user = await db_user.findOne({
            _id: id
        })
        // if post does not exist
        if (!user) {
            return next();
        }
        const updateUser = await db_user.update({
            _id: id
        },
            {
                $set: result
            },
            {
                upsert: true
            }
        )
        res.json(updateUser)
    }
    catch (err) {
        next(err)
    }
})

// Delete specific post
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await db_user.findOne({
            _id: id
        })
        // Post does not exist
        if (!user) {
            next();
        }
        await db_user.remove({
            _id: id
        })
        res.json({
            message: 'Success'
        })
    }
    catch (err) {
        next(err)
    }
})


module.exports = router;