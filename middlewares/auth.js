const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    try {
        let { authorization } = req.headers;
        if (authorization && authorization.startsWith('Bearer ')) {
            authorization = authorization.replace("Bearer ", "");
        }

        if (authorization) {
            const decoded = jwt.verify(authorization, 'jsonWebToken');
            if (decoded) {
                req.body.verified = true;
                next();
            }
            else {
                res.status(401).json({ success: false, err: 'Unauthorized' });
            }
        }
        else {
            res.status(401).json({ success: false, err: 'Unauthorized' });
        }
    }
    catch(err) {
        res.status(401).json({ success: false, err: err.message || err || 'Unauthorized' });
    }
}