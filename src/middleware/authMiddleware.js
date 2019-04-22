import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import HttpStatus from 'http-status-codes'
import dotenv from 'dotenv';
dotenv.config();

const TOKENTIME = 60 * 60 * 24 * 30; // 30 Days
const SECRET = process.env.PASSPORT_SECRET;

let authenticate = expressJwt({ secret: SECRET });

let generateAccessToken = (req, res, next) => {
  req.token = req.token || {};
  req.token = jwt.sign({
    id: req.user.id,
  }, SECRET, {
    expiresIn: TOKENTIME
  });
  next();
}

let respond = (req, res) => {
  res.status(HttpStatus.OK).json({
    user: req.user.username,
    token: req.token
  });
}

module.exports = {
  authenticate,
  generateAccessToken,
  respond
};
