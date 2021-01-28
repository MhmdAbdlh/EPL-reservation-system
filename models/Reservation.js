const mongoose = require('mongoose');
const schema = mongoose.schema;
const reservationSchema = new schema ({
    userID: {
        type: String,
        required: true
    },
    matchID: {
        type: String,
        required: true
    },
    CCN: {
        type: Number,
        required: true
    },
    PIN: {
        type: Number,
        required: true
    },
    seats: {
        type: [[Number]],
        required: true
    }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = {
    Reservation
}