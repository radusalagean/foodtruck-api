import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

let Account = new Schema({
  username: String,
  password: String,
  image: String,
  joined: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  versionKey: false
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
