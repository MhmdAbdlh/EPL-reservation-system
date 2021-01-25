const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require ('bcrypt');
const { isEmail } = require('validator');
const userSchema = new schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Minimum password length is 8 characters']
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    role: {
        type: String,
        enum: ['Manager', 'Fan'],
        required: true
    },
    authenticated: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function({username, password}) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect username');
};
const User = mongoose.model('User', userSchema);
module.exports = User;