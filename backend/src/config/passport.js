import passport from 'passport';
import Strategy from 'passport-github2';
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
                    const email =
                        profile.emails && profile.emails[0]
                            ? profile.emails[0].value
                            : null;
                    const [user] = await db.User.findOrCreate({
                        where: { githubId: profile.id },
                        defaults: {
                            githubId: profile.id,
                            username: profile.username,
                            email: email,
                        },
                    });
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
        } catch (error) {
            done(error, null);
        }
    });
};
