import HttpStatus from 'http-status-codes'
import Foodtruck from '../model/foodtruck';
import Review from '../model/review';
import { 
  Router 
} from 'express';
import {
  readFoodtrucksAggregate,
  readFoodtruckAggregate,
  readFoodtrucksAggregateByOwner
} from '../db/aggregates';
import {
  jsonMsg
} from '../helpers/jsonResponseHelper';
import { 
  authenticate 
} from '../middleware/authMiddleware';
import {
  getFoodtruckImageUpload,
  createFoodtruck500Image,
  createFoodtruckThumbnail,
  getFoodtruckImageName,
  removeFoodtruckImageFile,
} from '../middleware/uploadMiddleware';

export default({ config, db }) => {
  let api = Router();

  // '/v1/foodtrucks/add' - CREATE FOODTRUCK
  api.post('/add', authenticate, (req, res) => {
    let newFoodtruck = new Foodtruck();
    newFoodtruck.name = req.body.name;
    newFoodtruck.foodtypes = req.body.foodtypes;
    newFoodtruck.coordinates.lat = req.body.coordinates.lat;
    newFoodtruck.coordinates.long = req.body.coordinates.long;
    newFoodtruck.owner = req.user.id;
    newFoodtruck.save((err, foodtruck) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while saving foodtruck: ' + err.toString()));
        return;
      }
      res.status(HttpStatus.CREATED).json({ _id: foodtruck._id });
    });
  });

  // '/v1/foodtrucks/get' - READ ALL FOODTRUCKS
  api.get('/get', (req, res) => {
    Foodtruck.aggregate(readFoodtrucksAggregate).exec((err, foodtrucks) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while reading foodtrucks: ' + err.toString()));
      }
      if (!foodtrucks) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Foodtrucks not found'));
        return;
      }
      res.status(HttpStatus.OK).json(foodtrucks);
    });
  });

  // '/v1/foodtrucks/get/owned_by/:owner_id' - READ USER'S FOODTRUCKS
  api.get('/get/owned_by/:owner_id', (req, res) => {
    Foodtruck.aggregate(readFoodtrucksAggregateByOwner(req.params.owner_id)).exec((err, foodtrucks) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while reading foodtrucks: ' + err.toString()));
          return;
      }
      if (!foodtrucks) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Foodtrucks not found'));
        return;
      }
      res.status(HttpStatus.OK).json(foodtrucks);
    });
  });

  // '/v1/foodtrucks/get/:id' - READ 1 FOODTRUCK
  api.get('/get/:id', (req, res) => {
    Foodtruck.aggregate(readFoodtruckAggregate(req.params.id)).exec((err, foodtrucks) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while reading foodtruck: ' + err.toString()));
        return;
      }
      let foodtruck = foodtrucks[0];
      res.status(HttpStatus.OK).json(foodtruck);
    });
  });

  // '/v1/foodtrucks/update/:id' - UPDATE FOODTRUCK
  api.put('/update/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error requesting foodtruck to modify: ' + err.toString()));
        return;
      }
      if (!foodtruck) {
        res.status(HttpStatus.NOT_FOUND)
          .json(jsonMsg('Foodtruck id not found'));
          return;
      }
      if (foodtruck.owner.toString() !== req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You must be the owner of this foodtruck in order to edit its details'));
        return;
      }
      foodtruck.name = req.body.name;
      foodtruck.foodtypes = req.body.foodtypes;
      foodtruck.coordinates.lat = req.body.coordinates.lat;
      foodtruck.coordinates.long = req.body.coordinates.long;
      foodtruck.lastUpdate = Date.now();
      foodtruck.save(err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while saving modified foodtruck: ' + err.toString()));
          return;
        }
        res.status(HttpStatus.OK).json(jsonMsg('Foodtruck info updated'));
      });
    });
  });

  // '/v1/foodtrucks/delete/:id' - DELETE FOODTRUCK
  api.delete('/delete/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while requesting foodtruck to delete: ' + err.toString()));
        return;
      }
      if (!foodtruck) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Foodtruck not found'));
        return;
      }
      if (foodtruck.owner.toString() !== req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You must be the owner of this foodtruck in order to remove it'));
        return;
      }
      // Remove the associated image
      if (foodtruck.image) {
        removeFoodtruckImageFile(foodtruck.image);
      }
      Foodtruck.deleteOne({
        _id: req.params.id
      }, err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while deleting foodtruck: ' + err.toString()));
          return;
        }
        // Delete all associated reviews
        Review.deleteMany({ foodtruck: req.params.id }, err => {
          if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while deleting reviews associated with the removed foodtruck: ' + err.toString()));
            return;
          }
          res.status(HttpStatus.OK).json(jsonMsg('Foodtruck successfully removed'));
        });
      });
    });
  });

  // '/v1/foodtrucks/image/:id - ADD FOODTRUCK IMAGE
  api.post('/image/:id', authenticate, (req, res) => {
    let upload = getFoodtruckImageUpload().single('image');
    let foodtruckId = req.params.id;
    Foodtruck.findById(foodtruckId, (err, foodtruck) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while searching for foodtruck: ' + err.toString()));
        return;
      }
      if (!foodtruck) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Foodtruck id not found'));
        return;
      }
      if (foodtruck.owner.toString() !== req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You must be the owner of this foodtruck in order to associate an image with it'));
        return;
      }
      upload(req, res, err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while uploading the image: ' + err.toString()));
          return;
        }
        if (!foodtruckId) {
          res.status(HttpStatus.NOT_FOUND)
            .json(jsonMsg('Foodtruck id not found in the request parameters'));
          return;
        }
        let savedFileName = getFoodtruckImageName(foodtruckId, req.file.originalname);
        createFoodtruckThumbnail(savedFileName);
        createFoodtruck500Image(savedFileName);
        foodtruck.image = savedFileName;
        foodtruck.lastUpdate = Date.now();
        foodtruck.save(err => {
          if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while saving the image name in the database: ' + err.toString()));
            return;
          }
          res.status(HttpStatus.CREATED).json(jsonMsg('Foodtruck image updated'));
        });
      });
    });
  });

  // '/v1/foodtrucks/image/:id - DELETE FOODTRUCK IMAGE
  api.delete('/image/:id', authenticate, (req, res) => {
    let foodtruckId = req.params.id;
    if (!foodtruckId) {
      res.status(HttpStatus.NOT_FOUND)
        .json(jsonMsg('Foodtruck id not found in the request parameters'));
      return;
    }
    Foodtruck.findById(foodtruckId, (err, foodtruck) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while searching for foodtruck: ' + err.toString()));
        return;
      }
      if (!foodtruck) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Foodtruck id not found'));
        return;
      }
      if (foodtruck.owner.toString() !== req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You must be the owner of this foodtruck in order to remove an associated image of it'));
        return;
      }
      if (!foodtruck.image) {
        res.status(HttpStatus.NOT_FOUND)
          .json(jsonMsg('No foodtruck image was found'));
          return;
      }
      removeFoodtruckImageFile(foodtruck.image);
      foodtruck.image = undefined;
      foodtruck.lastUpdate = Date.now();
      foodtruck.save(err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while removing the image name in the database: ' + err.toString()));
          return;
        }
        res.status(HttpStatus.OK).json(jsonMsg('Foodtruck image removed'));
      });
    });
  });

  // Get reviews for a specific foodtruck id
  // '/v1/foodtrucks/reviews/get/:foodtruck_id'
  api.get('/reviews/get/:foodtruck_id', (req, res) => {
    Review.find({ foodtruck: req.params.foodtruck_id })
      .sort({ lastUpdate: -1 })
      .populate('author')
      .exec((err, reviews) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while reading reviews for the specified foodtruck: ' + err.toString()));
        return;
      }
      res.status(HttpStatus.OK).json(reviews);
    });
  });

  // Get authenticated user's review for a specific foodtruck id
  // '/v1/foodtrucks/reviews/get/my/:foodtruck_id
  api.get('/reviews/get/my/:foodtruck_id', authenticate, (req, res) => {
    Review.findOne({
      foodtruck: req.params.foodtruck_id,
      author: req.user.id
    })
    .populate('author')
    .exec((err, review) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while requesting your review for the specified foodtruck: ' + err.toString()))
        return;
      }
      if (!review) {
        res.status(HttpStatus.NOT_FOUND)
          .json(jsonMsg('No review was added from your account for this foodtruck'));
          return;
      }
      res.status(HttpStatus.OK).json(review);
    })
  })

  // Add review for a specific foodtruck id
  // '/v1/foodtrucks/reviews/add/:foodtruck_id'
  api.post('/reviews/add/:foodtruck_id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.foodtruck_id, (err, foodtruck) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while requesting the foodtruck associated with the review: ' + err.toString()));
        return;
      }
      if (!foodtruck) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('No foodtruck found for the given id'));
          return;
      }
      if (foodtruck.owner.toString() === req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You cannot review your own foodtruck'));
        return;
      }
      Review.findOne({ author: req.user.id }, (err, review) => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while verifying author eligibility: ' + err.toString()));
          return;
        }
        if (review) {
          res.status(HttpStatus.FORBIDDEN)
            .json(jsonMsg('You already have a review submitted, please edit or remove it instead'));
            return;
        }
        let newReview = new Review();
        newReview.title = req.body.title;
        newReview.text = req.body.text;
        newReview.rating = req.body.rating;
        newReview.foodtruck = foodtruck._id;
        newReview.author = req.user.id;
        newReview.save((err, review) => {
          if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while saving the review: ' + err.toString()));
            return;
          }
          foodtruck.reviews.push(newReview);
          foodtruck.save(err => {
            if (err) {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(jsonMsg('Error while associating the review with the foodtruck: ' + err.toString()));
              return;
            }
            res.status(HttpStatus.CREATED).json(jsonMsg('Review added successfully'));
          });
        });
      });
    });
  });

  // Update Review
  // '/v1/foodtrucks/reviews/update/:id'
  api.put('/reviews/update/:id', authenticate, (req, res) => {
    Review.findById(req.params.id, (err, review) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error requesting review to modify: ' + err.toString()));
        return;
      }
      if (review.author.toString() !== req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You must be the owner of this review in order to edit it'));
        return;
      }
      review.title = req.body.title;
      review.text = req.body.text;
      review.rating = req.body.rating;
      review.lastUpdate = Date.now();
      review.save(err => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while saving modified review: ' + err.toString()));
          return;
        }
        res.status(HttpStatus.OK).json(jsonMsg('Review updated'));
      });
    });
  });

  // Remove review
  // '/v1/foodtrucks/reviews/delete/:id'
  api.delete('/reviews/delete/:id', authenticate, (req, res) => {
    Review.findById(req.params.id, (err, review) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(jsonMsg('Error while requesting review to delete: ' + err.toString()));
        return;
      }
      if (!review) {
        res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Review not found'));
        return;
      }
      if (review.author.toString() !== req.user.id) {
        res.status(HttpStatus.FORBIDDEN)
          .json(jsonMsg('You must be the owner of this review in order to remove it'));
        return;
      }
      Foodtruck.findById(review.foodtruck, (err, foodtruck) => {
        if (err) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(jsonMsg('Error while locating the corresoinding foodtruck: ' + err.toString()));
          return;
        }
        if (!foodtruck) {
          res.status(HttpStatus.NOT_FOUND).json(jsonMsg('Corresponding foodtruck not found'));
          return;
        }
        Review.deleteOne({
          _id: req.params.id
        }, err => {
          if (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json(jsonMsg('Error while deleting review: ' + err.toString()));
            return;
          }
          let index = foodtruck.reviews.indexOf(req.params.id);
          if (index >= 0 && index < foodtruck.reviews.length) {
            foodtruck.reviews.splice(index, 1);
            foodtruck.save(err => {
              if (err) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                  .json(jsonMsg('Error while dissociating the review with the foodtruck: ' + err.toString()));
                return;
              }
              res.status(HttpStatus.OK).json(jsonMsg('Review successfully removed'));
            });
          } else {
            res.status(HttpStatus.OK).json(jsonMsg('Review successfully removed'));
          }
        });
      });
    });
  });

  return api;
}
