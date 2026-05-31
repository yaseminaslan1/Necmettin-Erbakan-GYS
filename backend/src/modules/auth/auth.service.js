const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { db } = require("../../config/database");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiration,
} = require("../../utils/jwt.utils");
const env = require("../../config/env");
const { sendPasswordResetEmail } = require("../../utils/email.service");

const RESET_TOKEN_EXPIRY_HOURS = 1;

class AuthService {
  /**
   * Register a new user with email/password
   */
  async register(userData) {
    const { email, password, name, role } = userData;

    // Check if email already exists
    const existingUser = await db("users").where("email", email).first();
    if (existingUser) {
      throw { statusCode: 409, message: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [userId] = await db("users").insert({
      email,
      password: hashedPassword,
      name,
      provider: "local",
    });

    // Assign selected role during registration
    const selectedRole = await db("roles").where("name", role).first();
    if (!selectedRole) {
      throw { statusCode: 400, message: "Invalid role selected" };
    }

    if (selectedRole.name === "admin") {
      throw { statusCode: 403, message: "Admin role cannot be selected during registration" };
    }

    if (selectedRole) {
      await db("user_roles").insert({
        user_id: userId,
        role_id: selectedRole.id,
      });
    }

    const user = await this.getUserById(userId);
    return this.generateTokens(user);
  }

  /**
   * Login with email/password
   */
  async login(user) {
    return this.generateTokens(user);
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in database
    await db("refresh_tokens").insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: getTokenExpiration(env.jwt.refreshExpiresIn),
    });

    // Get user with roles
    const userWithRoles = await this.getUserWithRoles(user.id);

    return {
      user: this.sanitizeUser(userWithRoles),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(token) {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw { statusCode: 401, message: "Invalid refresh token" };
    }

    // Check if token exists in database
    const storedToken = await db("refresh_tokens")
      .where("token", token)
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!storedToken) {
      throw { statusCode: 401, message: "Refresh token expired or revoked" };
    }

    // Get user
    const user = await this.getUserById(decoded.id);
    if (!user || !user.is_active) {
      throw { statusCode: 401, message: "User not found or inactive" };
    }

    // Delete old refresh token
    await db("refresh_tokens").where("id", storedToken.id).del();

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await db("refresh_tokens")
        .where("user_id", userId)
        .andWhere("token", refreshToken)
        .del();
    }
    return true;
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId) {
    await db("refresh_tokens").where("user_id", userId).del();
    return true;
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return db("users").where("id", id).first();
  }

  /**
   * Get user with roles
   */
  async getUserWithRoles(userId) {
    const user = await db("users").where("id", userId).first();
    if (!user) return null;

    const roles = await db("user_roles")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", userId)
      .select("roles.id", "roles.name", "roles.description");

    const permissions = await db("user_roles")
      .join(
        "role_permissions",
        "user_roles.role_id",
        "role_permissions.role_id",
      )
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .where("user_roles.user_id", userId)
      .select("permissions.name")
      .distinct();

    return {
      ...user,
      roles,
      permissions: permissions.map((p) => p.name),
    };
  }

  /**
   * Remove sensitive data from user object
   */
  sanitizeUser(user) {
    const { password, provider_id, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(user) {
    return this.generateTokens(user);
  }

  /**
   * Forgot password - create reset token and send email with link
   */
  async forgotPassword(email) {
    const user = await db("users")
      .where("email", email)
      .andWhere("provider", "local")
      .first();
    if (!user) {
      return {
        success: true,
        message:
          "Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    await db("password_reset_tokens").where("user_id", user.id).del();
    await db("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;
    const emailResult = await sendPasswordResetEmail(user.email, resetLink);

    if (!emailResult.sent) {
      return {
        success: true,
        message:
          "Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir.",
        resetToken: env.nodeEnv === "development" ? token : undefined,
      };
    }

    return {
      success: true,
      message:
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.",
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const row = await db("password_reset_tokens")
      .where("token", token)
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!row) {
      throw {
        statusCode: 400,
        message: "Geçersiz veya süresi dolmuş sıfırlama bağlantısı",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db("users").where("id", row.user_id).update({
      password: hashedPassword,
      updated_at: db.fn.now(),
    });
    await db("password_reset_tokens").where("id", row.id).del();

    const {
      createNotification,
    } = require("../notifications/notification.service");
    createNotification(
      row.user_id,
      "password_reset",
      "Şifre sıfırlandı",
      "Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz.",
    );

    return { success: true, message: "Şifre başarıyla güncellendi" };
  }
}

module.exports = new AuthService();