const mongoose = require('mongoose');
const schema = mongoose.Schema;
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
    seatRow: {
        type: Number,
        required: true
    },
    seatNo: {
        type: Number,
        required: true
    }
}, {timestamps: true});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;