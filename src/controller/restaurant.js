import mongoose from 'mongoose';
import { Router } from 'express';
import Restaurant from '../model/restaurant';

export default({ config, db }) => {
  let api = Router();

  // '/v1/restaurant/add' - CREATE
  api.post('/add', (req, res) => {
    let newRest = new Restaurant();
    newRest.name = req.body.name;

    newRest.save(err => {
      if (err) {
        res.send(err)
      }
      res.json({ message: 'Restaurant saved successfully' })
    });
  });

  // '/v1/restaurant' - READ
  api.get('/', (req, res) => {
    Restaurant.find({}, (err, restaurants) => {
      if (err) {
        res.send(err);
      }
      res.json(restaurants);
    });
  });

  // '/v1/restaurant/:id' - READ 1
  api.get('/:id', (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
      if (err) {
        res.send(err);
      }
      res.json(restaurant);
    });
  });

  // '/v1/restaurant/:id' - UPDATE
  api.put('/:id', (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
      if (err) {
        res.send(err);
      }
      restaurant.name = req.body.name;
      restaurant.save(err => {
        if (err) {
          res.send(err);
        }
        res.json({ message: "Restaurant info updated" });
      });
    });
  })

  // '/v1/restaurant/:id' - DELETE
  api.delete('/:id', (req, res) => {
    Restaurant.remove({
      _id: req.params.id
    }, (err, restaurant) => {
      if (err) {
        res.send(err);
      }
      res.json({ message: "Restaurant successfully removed" });
    });
  });

  return api;
}
