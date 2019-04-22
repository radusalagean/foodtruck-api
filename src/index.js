import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import passport from 'passport';
import config from './config';
import routes from './routes';
const LocalStrategy = require('passport-local').Strategy;

import { PUBLIC_ROOT_DIRECTORY } from './middleware/uploadMiddleware'

let app = express();
app.server = http.createServer(app);

// Middleware
// Parse application/json
app.use(bodyParser.json({
  limit: config.bodyLimit
}));

// Passport Config
app.use(passport.initialize());
let Account = require('./model/account');
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// API Routes v1
app.use('/foodtruck-api/v1', routes);

// Public
app.use(express.static(PUBLIC_ROOT_DIRECTORY));

app.server.listen(config.port);
console.log(`Started on port ${app.server.address().port}`);

export default app;