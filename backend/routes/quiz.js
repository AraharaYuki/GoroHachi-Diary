const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const correctAnswers = {
    answerA: process.env.ANSWER_A,
    answerB: process.env.ANSWER_B,
    answerC: process.env.ANSWER_C,
    answerD: process.env.ANSWER_D,
};

router.post('/check-answers', (req, res) => {
    const { answerA, answerB, answerC, answerD } = req.body;

    console.log('Received answers:', answerA, answerB, answerC, answerD);
    console.log('Correct answers:', correctAnswers.answerA, correctAnswers.answerB, correctAnswers.answerC, correctAnswers.answerD);

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
