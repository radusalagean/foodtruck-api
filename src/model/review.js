import mongoose from 'mongoose';
import Foodtruck from './foodtruck'
let Schema = mongoose.Schema;

let ReviewSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: [1, 'The title field shouldn\'t be empty'],
    maxLength: [100, 'The title shouldn\'t be longer than 100 characters']
  },
  text: {
    type: String,
    required: true,
    minLength: [1, 'The review content field shouldn\'t be empty'],
    maxLength: [1000, 'The review content shouldn\'t be longer than 1000 characters']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  foodtruck: {
    type: Schema.Types.ObjectId,
    ref: 'Foodtruck',
    required: true
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
