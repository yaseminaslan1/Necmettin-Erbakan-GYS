require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'project_tracking',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Google OAuth - devre dışı (yorum satırında)
  // google: {
  //   clientId: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  // },
  // GitHub OAuth - devre dışı (yorum satırında)
  // github: {
  //   clientId: process.env.GITHUB_CLIENT_ID,
  //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
  //   callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  // },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // SMTP (E-posta)
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || 'Proje Takip <noreply@example.com>',
  },
};
