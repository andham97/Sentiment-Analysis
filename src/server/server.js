/**
 * @module Server entry
 */
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import passport from 'passport';
import Auth0Security from 'passport-auth0';
import ExpressSanitizer from 'express-sanitizer';
import Helmet from 'helmet';
import Https from 'https';
import Http from 'http';
import fs from 'fs';
import Wordcloud from './routes/wordcloud';
import Search from './routes/search';
import WebScraper from './routes/webscraper';
import Auth from './routes/auth';
import Scheduler from './scheduler';
import { getCloudant } from './ics';

dotenv.config();

passport.use(new Auth0Security({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL,
}, (accessToken, refreshToken, extraParams, profile, done) => done(null, profile)));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/**
 * Express application
 * @type {express-server}
 */
const app = express();

app.use(Helmet());
app.use(ExpressSanitizer());
app.use(express.static(path.resolve(process.cwd(), 'build/client')));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { secure: false },
  resave: false,
  saveUninitialized: true,
  name: '',
}));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', Auth);
app.use('/api/auth', (err, req, res) => {
  res.status(500).send(JSON.stringify(err, null, 2));
});
app.use('/api', (req, res, next) => {
  const start = new Date().getTime();
  const timeLimit = 5000;
  const cb = () => {
    if (!getCloudant())
      setTimeout(cb, 100);
    else if (new Date().getTime() - start >= timeLimit)
      res.status(500).send('Error');
    else
      setTimeout(next, 100);
  };
  cb();
});

app.use('/api/wordcloud', Wordcloud);

app.use('/api/search', Search);

app.use('/api', (req, res, next) => {
  if (req.user || req.headers.api_key === process.env.SCRAPER_API_KEY)
    return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/api/auth/login');
});

app.use('/api/ws', WebScraper);
app.use('/api', (req, res) => {
  res.status(404).send('API endpoint not found');
});
app.get('/admin', (req, res, next) => {
  if (req.user)
    return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/api/auth/login');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

/**
 * The server object for export to test suite
 * @type {HTTPServer}
 */
const server = (process.env.SSL_KEY && process.env.SLL_CERT)
  ? Https.createServer({
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
  }, app)
  : Http.createServer(app);
server.listen(process.env.PORT || 3000, () => {
  process.stdout.write(`listening on port ${process.env.PORT || 3000}\n`);
  if (process.argv.indexOf('--no-scheduler') === -1)
    Scheduler();
});

export { app, server };
