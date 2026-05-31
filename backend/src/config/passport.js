const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const env = require('./env');
const { db } = require('./database');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt.secret,
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await db('users')
      .where('id', payload.id)
      .andWhere('is_active', true)
      .first();

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Local Strategy (Email/Password)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await db('users')
        .where('email', email)
        .andWhere('provider', 'local')
        .first();

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.is_active) {
        return done(null, false, { message: 'Account is deactivated' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

/* Google Strategy - devre dışı (yorum satırında)
if (env.google.clientId && env.google.clientSecret) {
  passport.use(new GoogleStrategy(
    {
      clientID: env.google.clientId,
      clientSecret: env.google.clientSecret,
      callbackURL: env.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db('users')
          .where('provider', 'google')
          .andWhere('provider_id', profile.id)
          .first();
        if (!user) {
          const existingUser = await db('users')
            .where('email', profile.emails[0].value)
            .first();
          if (existingUser) {
            return done(null, false, { message: 'Email already registered with different method' });
          }
          const [userId] = await db('users').insert({
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            provider: 'google',
            provider_id: profile.id,
            email_verified_at: new Date(),
          });
          user = await db('users').where('id', userId).first();
          const developerRole = await db('roles').where('name', 'developer').first();
          if (developerRole) {
            await db('user_roles').insert({
              user_id: userId,
              role_id: developerRole.id,
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}
*/

/* GitHub Strategy - devre dışı (yorum satırında)
if (env.github.clientId && env.github.clientSecret) {
  passport.use(new GitHubStrategy(
    {
      clientID: env.github.clientId,
      clientSecret: env.github.clientSecret,
      callbackURL: env.github.callbackUrl,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db('users')
          .where('provider', 'github')
          .andWhere('provider_id', profile.id)
          .first();
        if (!user) {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
          const existingUser = await db('users')
            .where('email', email)
            .first();
          if (existingUser) {
            return done(null, false, { message: 'Email already registered with different method' });
          }
          const [userId] = await db('users').insert({
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos[0]?.value,
            provider: 'github',
            provider_id: profile.id,
            email_verified_at: new Date(),
          });
          user = await db('users').where('id', userId).first();
          const developerRole = await db('roles').where('name', 'developer').first();
          if (developerRole) {
            await db('user_roles').insert({
              user_id: userId,
              role_id: developerRole.id,
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}
*/

module.exports = passport;
