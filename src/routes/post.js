const express = require('express');
const { postSchema } = require('../db/model/schema');
const db = require('../db/connection');
const db_post = db.get('post');
const { verifyToken } = require('../middlewares/auth')

const router = express.Router();



// API Endpoints
// get all post
router.get('/', verifyToken, async (req, res, next) => {
    try {
        console.log(">>>>>> User",req.user)
        const allPost = await db_post.find({});
        res.json(allPost)
    } catch (error) {
        next(error)
    }
})

// get a specific post
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await db_post.findOne({
            _id: id
        })
        if (!post) {
            const error = new Error('Post does not exist');
            return next(error)
        }
        res.json(post);
    }
    catch (error) {
        next(error)
    }
})

// Create a new post
router.post('/', async (req, res, next) => {
    try {
        const { name, model, price } = req.body;
        const result = await postSchema.validateAsync({ name, model, price })
        const post = await db_post.findOne({
            name
        })
        // if post already exist
        if (post) {
            res.status(409);//conflict
            const error = new Error('Post already exist');
            return next(error)
        }
        // /else
        const new_post = await db_post.insert({
            name, model, price
        })
        console.log('post has been created');
        res.status(201).json(new_post);
    } catch (error) {
        next(error)
    }
})

// update a specific post
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, model, price } = req.body;
        const result = await postSchema.validateAsync({ name, model, price });
        const post = await db_post.findOne({
            _id: id
        })
        // if post does not exist
        if (!post) {
            return next();
        }
        const updatePost = await db_post.update({
            _id: id
        },
            {
                $set: result
            },
            {
                upsert: true
            }
        )
        res.json(updatePost)
    }
    catch (err) {
        next(err)
    }
})

// Delete specific post
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await db_post.findOne({
            _id: id
        })
        // Post does not exist
        if (!post) {
            next();
        }
        await db_post.remove({
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