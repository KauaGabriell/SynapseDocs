import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import db from '../models/index.js';

export default (passport) => {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          // Procura usuário pelo GitHub ID
          let user = await db.User.findOne({
            where: { githubid: profile.id }
          });

          // Se não existir, cria
          if (!user) {
            user = await db.User.create({
              username: profile.username,
              email: profile.emails?.[0]?.value || null,
              githubid: profile.id,
              password_hash: null
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id_user);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
