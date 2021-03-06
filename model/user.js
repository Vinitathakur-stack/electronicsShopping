const mongoose = require('mongoose');

// user schema
const UserSchema = new mongoose.Schema({
     //   First name field
     firstname:{
      type:String,
      required:true
    },
     //   Last Name field
    lastname:{
      type:String,
      required:true
    },
    // email field
    email: {
      type: String,
      required: [true, "Please provide an Email!"],
      unique: [true, "Email Exist"],
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: '{VALUE} is not a valid email!'
      }
    },
  
    //   password field
    password: {
      type: String,
      required: [true, "Please provide a password!"],
      unique: false,
    },
    roles: [{ type: 'String' }],
    isVerified: { type: Boolean, default: false },
  });
// Export the model
module.exports = mongoose.model('User', UserSchema);