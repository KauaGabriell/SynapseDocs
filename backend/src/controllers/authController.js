import jwt from 'jsonwebtoken';

const authController = {};
authController.githubCallback = async function githubCallback(req, res) {
  try {
    const payload = { id: req.user.id_user};
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`http://localhost:5173/login-error`);
  }
}

export default authController;
