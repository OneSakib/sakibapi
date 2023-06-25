const express = require('express');
const { userSchema } = require('../db/model/schema');
const db = require('../db/connection');
const db_user = db.get('user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const router = express.Router();
const { verifyToken } = require('../middleware/auth')

// API Endpoints
// get all user
router.get('/users', verifyToken, async (req, res, next) => {
    try {
        const allUser = await db_user.find({});
        return res.json(allUser)
    } catch (error) {
        res.status(409);//conflict
        return res.json(error);
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
            return res.json(err)
        }
        const user = await db_user.findOne({
            email: email
        })
        if (!user) {
            res.status(409);//conflict
            return res.json({ "message": 'User does not exist' });
        }
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create Token
            const token = jwt.sign({
                user_id: user.id, "email": email.toLowerCase()
            },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '2h'
                }
            )
            // Save user token
            user.token = token;
            const response = { 'email': email, 'name': user.name, "token": user.token }
            return res.json(response);
        }
        else {
            res.status(409);//conflict
            return res.json({ "message": "Authorization Failed" });
        }

    }
    catch (error) {
        res.status(409);//conflict
        return res.json(error);
    }
})

// Create a new User
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
            return res.json(err)
        }
        const user = await db_user.findOne({
            email
        })
        // if post already exist
        if (user) {
            res.status(409);//conflict
            return res.json({ "message": 'Email already exist' });
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
        return res.status(201).json(response);
    } catch (error) {
        res.status(409);//conflict
        return res.json(error);
    }
})

// // update a specific User
// router.put('/update', verifyToken, async (req, res, next) => {
//     try {
//         const { name, password } = req.body;
//         const email = req?.user?.email
//         const result = userSchema.validate({ name, email, password })
//         if (result?.error) {
//             let err = []
//             result.error.details.map((ele) => {
//                 let key = ele.path[0]
//                 let value = ele.message
//                 let e = {}
//                 e[key] = value
//                 err.push(e)
//             })
//             res.status(409);//conflict
//             return res.json(err)
//         }
//         const user = await db_user.findOne({
//             email
//         })
//         // if post does not exist
//         if (!user) {
//             res.status(409);//conflict
//             return res.json({ "message": 'User does not exist' });
//         }
//         const updateUser = await db_user.update({
//             email
//         },
//             {
//                 $set: result
//             },
//             {
//                 upsert: true
//             }
//         )
//         return res.json(updateUser)
//     }
//     catch (error) {
//         res.status(409);//conflict
//         return res.json(error);
//     }
// })

// // Delete specific user
// router.delete('/delete', verifyToken, async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const user = await db_user.findOne({
//             _id: id
//         })
//         // Post does not exist
//         if (!user) {
//             res.status(409);//conflict
//             return res.json({ "message": 'Used does not exist' });
//         }
//         await db_user.remove({
//             _id: id
//         })
//         return res.json({
//             message: 'Successfully delete account'
//         })
//     }
//     catch (error) {
//         res.status(409);//conflict
//         return res.json(error);
//     }
// })


module.exports = router;