const passport = require('passport');
const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response.utils');
const env = require('../../config/env');

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Registration successful', 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Login with email/password
   * POST /api/auth/login
   */
  async login(req, res, next) {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      try {
        if (err) {
          return errorResponse(res, 'Authentication error', 500);
        }

        if (!user) {
          return errorResponse(res, info?.message || 'Invalid credentials', 401);
        }

        const result = await authService.login(user);

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.nodeEnv === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return successResponse(res, {
          user: result.user,
          accessToken: result.accessToken,
        }, 'Login successful');
      } catch (error) {
        return errorResponse(res, error.message, error.statusCode || 500);
      }
    })(req, res, next);
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      // Set new refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Token refreshed');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await authService.logout(req.user.id, refreshToken);

      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const user = await authService.getUserWithRoles(req.user.id);
      return successResponse(res, authService.sanitizeUser(user));
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /* Google/GitHub OAuth - devre dışı (yorum satırında)
  googleAuth(req, res, next) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  }

  async googleCallback(req, res, next) {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      try {
        if (err || !user) {
          return res.redirect(`${env.frontendUrl}/login?error=${encodeURIComponent(info?.message || 'Authentication failed')}`);
        }
        const result = await authService.handleOAuthCallback(user);
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.nodeEnv === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return res.redirect(`${env.frontendUrl}/auth/callback?token=${result.accessToken}`);
      } catch (error) {
        return res.redirect(`${env.frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      }
    })(req, res, next);
  }

  githubAuth(req, res, next) {
    passport.authenticate('github', {
      scope: ['user:email'],
    })(req, res, next);
  }

  async githubCallback(req, res, next) {
    passport.authenticate('github', { session: false }, async (err, user, info) => {
      try {
        if (err || !user) {
          return res.redirect(`${env.frontendUrl}/login?error=${encodeURIComponent(info?.message || 'Authentication failed')}`);
        }
        const result = await authService.handleOAuthCallback(user);
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: env.nodeEnv === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return res.redirect(`${env.frontendUrl}/auth/callback?token=${result.accessToken}`);
      } catch (error) {
        return res.redirect(`${env.frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      }
    })(req, res, next);
  }
  */

  /**
   * Forgot password - request reset token
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      const data = { message: result.message };
      if (result.resetToken) data.resetToken = result.resetToken;
      return successResponse(res, data, result.message);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      return successResponse(res, null, 'Şifre başarıyla güncellendi');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new AuthController();
