const mongoose = require('mongoose');
const schema = mongoose.Schema;
const stadiumSchema = new schema({
    name: {
        type: String,
        required: true
    },
    numRows: {
        type: Number,
        required: true
    },
    seats_per_row: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const Stadium = mongoose.model('Stadium', stadiumSchema);
module.exports = Stadium;