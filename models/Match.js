const mongoose = require('mongoose');
const schema = mongoose.Schema;
const matchSchema = new schema({
    home_team: {
        type: String,
        //enum: [],
        required: true
    },
    away_team: {
        type: String,
        //enum: [],
        required: true
    },
    match_venue: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    referee: {
        type: String,
        required: true
    },
    linesman1: {
        type: String,
        required: true
    },
    linesman2: {
        type: String,
        required: true
    },
    lounge: {
    type: [[String]],
    required: true
    }
}, {timestamps: true})

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;