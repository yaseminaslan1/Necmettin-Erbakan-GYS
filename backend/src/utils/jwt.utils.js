const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Get token expiration date
 */
const getTokenExpiration = (expiresIn) => {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  
  if (!match) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 's':
      return new Date(now.getTime() + value * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
};
