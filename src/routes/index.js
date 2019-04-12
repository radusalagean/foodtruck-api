import express from 'express';
import config from '../config';
import middleware from '../middleware';
import initializeDb from "../db";
import restaurant from '../controller/restaurant';

let router = express();

// Connect to DB
initializeDb(db => {
  // Internal MW
  router.use(middleware({config, db}));
  // Api Routes v1 (/v1)
  router.use('/restaurant', restaurant({ config, db }));
});

export default router;
