import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let FoodtruckSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [1, 'The foodtruck name field shouldn\'t be empty'],
    maxlength: [100, 'The foodtruck name shouldn\'t be longer than 100 characters']
  },
  foodtypes: {
    type: Array,
    required: true,
    validate: [{
      validator: array => array.every(item => typeof item === 'string'),
      message: 'All items in the foodtypes array must be of type String'
    }, {
      validator: array => array.length > 0,
      message: 'The foodtypes array cannot be empty'
    }, {
      validator: array => array.length <= 10,
      message: 'The foodtypes array cannot contain more than 10 items'
    }, {
      validator: array => array.every(item => item.length > 0),
      message: 'A foodtype must be at least one character long'
    }, {
      validator: array => array.every(item => item.length <= 50),
      message: 'A foodtype must be at most 50 characters long'
    }]
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    long: {
      type: Number,
      required: true
    }
  },
  image: String,
  owner: {
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
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  versionKey: false
});

module.exports = mongoose.model('Foodtruck', FoodtruckSchema);
