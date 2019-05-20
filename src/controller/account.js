import { Router } from 'express';
import Account from '../model/account';
import passport from 'passport';
import HttpStatus from 'http-status-codes';
import {
  jsonMsg
} from '../helpers/jsonResponseHelper';

import {
  generateAccessToken,
  respond,
  authenticate
} from '../middleware/authMiddleware';
import {
  getProfileImageUpload,
  createProfileThumbnail,
  getProfileImageName,
  removeProfileImageFile,
} from '../middleware/uploadMiddleware';

export default ({ config, db }) => {
  let api = Router();

  // '/v1/account/register'
  api.post('/register', (req, res) => {
    Account.findOne({
      username: {
        $regex: new RegExp('^' + req.body.username + '$', 'i')
      }
    }, (err, user) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while searching for the specified account: ' + err.toString()));
        return;
      }
      if (user) {
        res.status(HttpStatus.CONFLICT)
          .json(jsonMsg('The username already exists'));
        return;
      }
      Account.register(new Account({
        username: req.body.username
      }), req.body.password, function (err, account) {
        if (err) {
          if (err.name == 'UserExistsError') {
            return res.status(HttpStatus.CONFLICT)
              .json(jsonMsg('Error while registering: ' + err.toString()));
          } else {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while registering: ' + err.toString()));
          }
        }
        passport.authenticate(
          'local', {
            session: false
          })(req, res, () => {
            res.status(HttpStatus.CREATED)
              .json(jsonMsg('New account created successfully'));
          });
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
  api.post('/logout', authenticate, (req, res) => {
    req.logout();
    res.status(HttpStatus.OK).json(jsonMsg('Logged out successfully'));
  });

  // '/v1/account/me'
  api.get('/me', authenticate, (req, res) => {
    Account.findById(req.user.id, (err, user) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while searching for your account: ' + err.toString()));
        return;
      }
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('User id not found'));
        return;
      }
      res.status(HttpStatus.OK).json(user);
    });
  });

  // '/v1/account/get/:id'
  api.get('/get/:id', (req, res) => {
    Account.findById(req.params.id, (err, user) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while searching for account: ' + err.toString()));
        return;
      }
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('User id not found'));
        return;
      }
      res.status(HttpStatus.OK).json(user);
    })
  });

  // '/v1/account/availability/:username'
  api.get('/availability/:username', (req, res) => {
    Account.findOne({ username: {
      $regex : new RegExp('^' + req.params.username + '$', 'i')
    } }, (err, user) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while searching for the specified account: ' + err.toString()));
        return;
      }
      res.status(user ? HttpStatus.CONFLICT : HttpStatus.OK).send();
    });
  });

  // '/v1/account/image'
  api.post('/image', authenticate, (req, res) => {
    let upload = getProfileImageUpload().single('image');
    let userId = req.user.id;
    Account.findById(userId, (err, user) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while searching for your account: ' + err.toString()));
        return;
      }
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('User id not found'));
        return;
      }
      upload(req, res, err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while uploading the image: ' + err.toString()));
          return;
        }
        if (!userId) {
          res.status(HttpStatus.NOT_FOUND)
            .json(jsonMsg('User id not found, are you signed in?'));
          return;
        }
        let savedFileName = getProfileImageName(userId, req.file.originalname);
        createProfileThumbnail(savedFileName);
        user.image = savedFileName;
        user.save(err => {
          if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while saving the image name in the database: ' + err.toString()));
            return;
          }
          res.status(HttpStatus.CREATED).json(jsonMsg('Profile image updated'));
        });
      });
    });
  });

  // '/v1/account/image'
  api.delete('/image', authenticate, (req, res) => {
    let userId = req.user.id;
    if (!userId) {
      res.status(HttpStatus.NOT_FOUND)
        .json(jsonMsg('User id not found, are you signed in?'));
      return;
    }
    Account.findById(userId, (err, user) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while searching for your account: ' + err.toString()));
        return;
      }
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('User id not found'));
        return;
      }
      if (!user.image) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('No image available for your account'));
        return;
      }
      removeProfileImageFile(user.image);
      user.image = undefined;
      user.save(err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while removing the image name in the database: ' + err.toString()));
        }
        res.status(HttpStatus.OK).json(jsonMsg('Profile image removed'));
      })
    });
  })

  return api;
}
