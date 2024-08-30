const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();

// コメントの取得
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.json(comments);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// コメントの作成
router.post('/', async (req, res) => {
    try {
        const { postId, author, content } = req.body;
        const comment = new Comment({ postId, author, content });
        await comment.save();
        res.status(201).send('Comment created');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
