import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

let Account = new Schema({
  username: String,
  password: String
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
