import express from 'express';
import passport from 'passport';
import authController from '../controllers/authController.js';
const router = express.Router();

//Redireciona da aplicação para o Github
router.get('/github',passport.authenticate('github', { scope: ['user:email'] }));
//Redireciona do Github para a aplicação de volta.
router.get('/github/callback',passport.authenticate('github', {failureRedirect: '/',failureMessage: true,}),authController.githubCallback);

export default router;