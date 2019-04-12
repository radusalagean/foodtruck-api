import mongoose from 'mongoose';
import { Router } from 'express';
import Foodtruck from '../model/foodtruck';
import Review from '../model/review';

export default({ config, db }) => {
  let api = Router();

  // '/v1/foodtruck/add' - CREATE
  api.post('/add', (req, res) => {
    let newFoodtruck = new Foodtruck();
    newFoodtruck.name = req.body.name;
    newFoodtruck.foodtype = req.body.foodtype;
    newFoodtruck.avgcost = req.body.avgcost;
    newFoodtruck.geometry.coordinates = req.body.geometry.coordinates;

    newFoodtruck.save(err => {
      if (err) {
        res.send(err)
      }
      res.json({ message: 'Foodtruck saved successfully' })
    });
  });

  // '/v1/foodtruck' - READ
  api.get('/', (req, res) => {
    Foodtruck.find({}, (err, foodtrucks) => {
      if (err) {
        res.send(err);
      }
      res.json(foodtrucks);
    });
  });

  // '/v1/foodtruck/:id' - READ 1
  api.get('/:id', (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      res.json(foodtruck);
    });
  });

  // '/v1/foodtruck/:id' - UPDATE
  api.put('/:id', (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      foodtruck.name = req.body.name;
      foodtruck.save(err => {
        if (err) {
          res.send(err);
        }
        res.json({ message: "Foodtruck info updated" });
      });
    });
  })

  // '/v1/foodtruck/:id' - DELETE
  api.delete('/:id', (req, res) => {
    Foodtruck.remove({
      _id: req.params.id
    }, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      res.json({ message: "Foodtruck successfully removed" });
    });
  });

  // Add review for a specific foodtruck id
  // '/v1/foodtruck/reviews/add/:id'
  api.post('/reviews/add/:id', (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      let newReview = new Review();
      newReview.title = req.body.title;
      newReview.text = req.body.text;
      newReview.foodtruck = foodtruck._id;
      newReview.save((err, review) => {
        if (err) {
          res.send(err);
        }
        foodtruck.reviews.push(newReview);
        foodtruck.save(err => {
          if (err) {
            res.send(err);
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
      }
      res.json(foodtrucks);
    });
  });

  return api;
}
