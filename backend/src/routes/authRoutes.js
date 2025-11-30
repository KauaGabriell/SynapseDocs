import { Router } from 'express';
import passport from 'passport';
import authController from '../controllers/authController.js';

const router = Router();

// Login manual
router.post('/login', authController.login);

// Registro manual
router.post('/register', authController.register);

// GitHub Login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login-error' }),
  authController.githubCallback
);

export default router;
