const jwt = require('jsonwebtoken');
const logger = require('../util/logger');
const secretKey = 'your-secret-key'; 

function jwtMiddleware(req, res, next) {
  const token = req.header('Authorization'); 
  if (!token) {
    logger.error('No token provided')
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    console.log('decode',decoded.email);
    res.locals.decodedEmail = decoded.email; // Store the decoded email in res.locals

    next();
  } catch (error) {
    logger.error(error)
    return res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = jwtMiddleware;
