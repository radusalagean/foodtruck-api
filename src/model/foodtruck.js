import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let foodtruckSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Foodtruck', foodtruckSchema);
