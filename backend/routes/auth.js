const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 管理者ログイン用のパスワード
const adminPassword = 'Appy0515';

// 管理者ログイン
router.post('/admin-login', async (req, res) => {
    const { password } = req.body;

    if (password !== adminPassword) {
        return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ role: 'admin' }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.send({ token });
});

module.exports = router;
