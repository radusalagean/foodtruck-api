import mongoose from 'mongoose';
import { Router } from 'express';
import Foodtruck from '../model/foodtruck';
import Review from '../model/review';

import { authenticate } from '../middleware/authMiddleware';

export default({ config, db }) => {
  let api = Router();

  // '/v1/foodtruck/add' - CREATE
  api.post('/add', authenticate, (req, res) => {
    let newFoodtruck = new Foodtruck();
    newFoodtruck.name = req.body.name;
    newFoodtruck.foodtype = req.body.foodtype;
    newFoodtruck.coordinates.lat = req.body.coordinates.lat;
    newFoodtruck.coordinates.long = req.body.coordinates.long;

    newFoodtruck.save(err => {
      if (err) {
        res.send(err)
        return;
      }
      res.json({ message: 'Foodtruck saved successfully' })
    });
  });

  // '/v1/foodtruck' - READ
  api.get('/', (req, res) => {
    Foodtruck.find({}, (err, foodtrucks) => {
      if (err || foodtrucks === null) {
        res.send(err);
        return;
      }
      res.json(foodtrucks);
    });
  });

  // '/v1/foodtruck/:id' - READ 1
  api.get('/:id', (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
        return;
      }
      res.json(foodtruck);
    });
  });

  // '/v1/foodtruck/:id' - UPDATE
  api.put('/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
        return;
      }
      foodtruck.name = req.body.name;
      foodtruck.foodtype = req.body.foodtype;
      foodtruck.coordinates.lat = req.body.coordinates.lat;
      foodtruck.coordinates.long = req.body.coordinates.long;
      foodtruck.save(err => {
        if (err) {
          res.send(err);
          return;
        }
        res.json({ message: "Foodtruck info updated" });
      });
    });
  })

  // '/v1/foodtruck/:id' - DELETE
  api.delete('/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params._id, (err, foodtruck) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (foodtruck === null) {
        res.status(404).send('Foodtruck not found');
        return;
      }
      Foodtruck.remove({
        _id: req.params.id
      }, (err, foodtruck) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.json({ message: "Foodtruck successfully removed" });
      });
    })

  });

  // Add review for a specific foodtruck id
  // '/v1/foodtruck/reviews/add/:id'
  api.post('/reviews/add/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
        return;
      }
      let newReview = new Review();
      newReview.title = req.body.title;
      newReview.text = req.body.text;
      newReview.rating = req.body.rating;
      newReview.foodtruck = foodtruck._id;
      newReview.save((err, review) => {
        if (err) {
          res.send(err);
          return;
        }
        foodtruck.reviews.push(newReview);
        foodtruck.save(err => {
          if (err) {
            res.send(err);
            return;
          }
          res.json({ message: 'Review added successfully' });
        });
      });
    });
  });

  // Get reviews for a specific foodtruck id
  // '/v1/foodtruck/reviews/:id'
  api.get('/reviews/:id', (req, res) => {
    Review.find({foodtruck: req.params.id}, (err, review) => {
      if (err) {
        res.send(err);
        return;
      }
      res.json(review);
    });
  });

  // Get food truck which serve a specific food type
  // '/v1/foodtruck/foodtype/:foodtype'
  api.get('/foodtype/:foodtype', (req, res) => {
    Foodtruck.find({foodtype: {
      $regex: new RegExp(req.params.foodtype.toLowerCase(), "i")
    }}, (err, foodtrucks) => {
      if (err) {
        res.send(err);
        return;
      }
      res.json(foodtrucks);
    });
  });

  return api;
}
