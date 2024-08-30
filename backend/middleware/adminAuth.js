const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // リクエストヘッダーの表示
    console.log('Authorization Header:', req.headers['authorization']);

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log('Authorization header missing');
        return res.status(401).send('Unauthorized: Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Token missing');
        return res.status(401).send('Unauthorized: Token missing');
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.status(401).send('Unauthorized: Invalid token');
        }

        console.log('Decoded Token:', decoded);

        if (decoded.role !== 'admin') {
            console.log('Unauthorized role:', decoded.role);
            return res.status(401).send('Unauthorized: Insufficient privileges');
        }

        req.user = decoded.user;
        next();
    });
};
