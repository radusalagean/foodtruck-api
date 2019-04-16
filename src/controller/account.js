import mongoose from 'mongoose';
import { Router } from 'express';
import Account from '../model/account';
import bodyParser from 'body-parser';
import passport from 'passport';
import config from '../config';

import { generateAccessToken, respond, authenticate } from '../middleware/authMiddleware';

export default ({ config, db }) => {
  let api = Router();

  // '/v1/account/register'
  api.post('/register', (req, res) => {
    Account.register(new Account({
      username: req.body.username
    }), req.body.password, function(err, account) {
        if (err) {
          if (err.name = 'UserExistsError') {
            console.log('User name already exists');
            return res.status(409).send(err);
          } else {
            return res.status(500).send('An error occurred: ' + err);
          }
        }
        passport.authenticate(
          'local', {
            session: false
          })(req, res, () => {
            res.status(200).send('New account created successfully');
          });
        });
      });

  // '/v1/account/login'
  api.post('/login', passport.authenticate(
    'local', {
      session: false,
      scope: []
    }), generateAccessToken, respond);

  // '/v1/account/logout'
  api.get('/logout', authenticate, (req, res) => {
    req.logout();
    res.status(200).send('Logged out successfully');
  });

  // '/v1/account/me'
  api.get('/me', authenticate, (req, res) => {
    res.status(200).json(req.user);
  });

  return api;
}
