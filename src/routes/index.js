import express from 'express';
import config from '../config';
import middleware from '../middleware';
import initializeDb from "../db/db";
import foodtruck from '../controller/foodtruck';
import account from '../controller/account';

let router = express();

// Connect to DB
initializeDb(db => {
  // Internal MW
  router.use(middleware({config, db}));
  // Api Routes v1 (/v1)
  router.use('/foodtrucks', foodtruck({ config, db }));
  router.use('/account', account({ config, db }));
});

export default router;
