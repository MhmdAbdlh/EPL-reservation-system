const mongoose = require('mongoose');
const schema = mongoose.Schema;
const TeamSchema = new schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: false
    }
});

const Team = mongoose.model('Team', TeamSchema);
module.exports = Team;