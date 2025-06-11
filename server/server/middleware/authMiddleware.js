const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('👉 Authorization header:', authHeader);

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: '🤷‍♀️ Authorization token is missing!'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // dane uzytkownika z tokena: userId i email

        next();
    } catch (err) {
        res.status(403).json({
            message: '🍎 invalid token or token timeout!'
        });
    }
}

function isAdmin(req, res, next) {
    if(req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            message: '🍎 Access denied. Admin only!'
        });
    }
}

module.exports = {
    verifyToken,
    isAdmin
};