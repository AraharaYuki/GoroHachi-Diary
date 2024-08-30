const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const correctAnswers = {
    answerA: "にこ",
    answerB: "さぶろう",
    answerC: "ななこ",
    answerD: "ごろう"
};

router.post('/check-answers', (req, res) => {
    const { answerA, answerB, answerC, answerD } = req.body;

    if (
        answerA === correctAnswers.answerA &&
        answerB === correctAnswers.answerB &&
        answerC === correctAnswers.answerC &&
        answerD === correctAnswers.answerD
    ) {
        // 環境変数から秘密鍵を取得
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            return res.status(500).send('Secret key is not defined');
        }

        // JWTトークンを作成
        const token = jwt.sign({ user: 'user' }, secretKey, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;
