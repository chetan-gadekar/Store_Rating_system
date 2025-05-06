const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, 'jgjjh', { expiresIn: '30d' }); // Replace 'your_jwt_secret' with your actual secret
};

module.exports = generateToken;
