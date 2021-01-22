const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
        required: true
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

const User = mongoose.model('User', userSchema);
module.exports = User;