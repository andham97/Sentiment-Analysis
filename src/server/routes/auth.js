import { Router } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

const router = new Router();
const isWhitelisted = user => process.env.ADMIN_WHITELIST.split(',').filter(email => user.emails.filter(val => email === val.value).length > 0).length > 0;

router.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile',
}), (req, res) => {
  res.redirect('/');
});

router.get('/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user) => {
    if (err)
      return next(err);
    if (!user)
      return res.redirect('/api/auth/login');
    req.logIn(user, (err) => {
      if (err)
        return next(err);
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || '/admin');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/whitelist', (req, res) => {
  if (!req.user)
    return res.json(false);
  res.json(isWhitelisted(req.user));
});

export default router;
export { isWhitelisted };
