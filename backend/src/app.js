const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const env = require('./config/env');
const { testConnection } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const roleRoutes = require('./modules/roles/role.routes');
const projectRoutes = require('./modules/projects/project.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const statsRoutes = require('./modules/statistics/stats.routes');
const goalRoutes = require('./modules/goals/goal.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Initialize passport
app.use(passport.initialize());
require('./config/passport');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/statistics', statsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);


const PORT = process.env.PORT || env.port || 3000;

// Start server
const startServer = async () => {
  // Test database connection
  try {
  await testConnection();
  console.log('Database connected');
} catch (err) {
  console.error('Database connection failed, continuing without DB');
}

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env.nodeEnv} mode`);
    console.log(`API available at /api`);
  });
};

startServer();

module.exports = app;