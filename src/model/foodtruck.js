import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let FoodtruckSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [1, 'The foodtruck name field shouldn\'t be empty'],
    maxlength: [100, 'The foodtruck name shouldn\'t be longer than 100 characters']
  },
  foodtype: {
    type: String,
    required: true,
    minlength: [1, 'The foodtype field shouldn\'t be empty'],
    maxlength: [100, 'The foodtype shouldn\'t be longer than 100 characters']
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
