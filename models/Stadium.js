const mongoose = require('mongoose');
const schema = mongoose.Schema;
const stadiumSchema = new schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    numRows: {
        type: Number,
        required: true,
        min: [3, 'minimum number of rows is 3!']
    },
    seats_per_row: {
        type: Number,
        required: true,
        min: [8, 'minimum number of seats per row is 8!']
    }
}, {timestamps: true})

const Stadium = mongoose.model('Stadium', stadiumSchema);
module.exports = Stadium;