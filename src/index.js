import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;

import config from './config';
import routes from './routes';

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

app.server.listen(config.port);
console.log(`Started on port ${app.server.address().port}`);

export default app;
