
const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  try {

    const token = req.headers.authorization.split(' ')[1];


    const decodedToken = jwt.verify(token, 'your-secret-key');


    req.userData = { userId: decodedToken.userId, email: decodedToken.email };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
