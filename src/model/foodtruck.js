import mongoose from 'mongoose';
import Review from './review';
let Schema = mongoose.Schema;

let FoodtruckSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [1, 'The foodtruck name field shouldn\'t be empty'],
    maxLength: [100, 'The foodtruck name shouldn\'t be longer than 100 characters']
  },
  foodtype: {
    type: String,
    required: true,
    minLength: [1, 'The foodtype field shouldn\'t be empty'],
    maxLength: [100, 'The foodtype shouldn\'t be longer than 100 characters']
  },
  coordinates: {
    "lat": {
      type: Number,
      required: true
    },
    "long": {
      type: Number,
      required: true
    }
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

module.exports = mongoose.model('Foodtruck', FoodtruckSchema);
