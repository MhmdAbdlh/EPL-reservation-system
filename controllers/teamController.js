const Stadium = require('../models/Team');

// list all teams
const allTeams = async (req, res) => {
    const teams = await Stadium.find({});
    res.json({'teams': teams});
}

module.exports = {
    allTeams
}