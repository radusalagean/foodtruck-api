import mongoose from 'mongoose';
import Foodtruck from './foodtruck'
let Schema = mongoose.Schema;

let ReviewSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: [1, 'The title field shouldn\'t be empty'],
    maxlength: [100, 'The title shouldn\'t be longer than 100 characters']
  },
  text: {
    type: String,
    required: true,
    minlength: [1, 'The review content field shouldn\'t be empty'],
    maxlength: [1000, 'The review content shouldn\'t be longer than 1000 characters']
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
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('Review', ReviewSchema);
