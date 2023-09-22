const mongoose = require('mongoose');
const createHttpError = require('http-errors');
const bcrypt = require('bcrypt');
const {roles} = require('../utils/constant');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    enum:[roles.admin,roles.moderator,roles.client],
    default:roles.client,
  }
});

UserSchema.pre("save",async function(next){
     try {
          if(this.isNew){
               const salt = await bcrypt.genSalt(10);
               const hashpass= await bcrypt.hash(this.password,salt);
               this.password = hashpass;
               if(this.email === process.env.ADMIN_EMAIL){
                this.role = roles.admin
               }
          }
          next()           
     } catch (error) {
          next(error)          
     }
});
UserSchema.methods.isValidPassword = async function (password) {
     try {
       return await bcrypt.compare(password, this.password);
     } catch (error) {
       throw createHttpError.InternalServerError(error.message);
     }
   };
   



const User = mongoose.model('user', UserSchema);
module.exports = User;
