const jwt = require('jsonwebtoken');

const secretKey = 'your-secret-key';

function createJwtToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1d' }); 
}

module.exports = {createJwtToken};
