const passport = require('passport');
const { errorResponse } = require('../utils/response.utils');

/**
 * JWT Authentication middleware
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return errorResponse(res, 'Authentication error', 500);
    }

    if (!user) {
      return errorResponse(res, info?.message || 'Unauthorized', 401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = {
  authenticate,
  optionalAuth,
};
