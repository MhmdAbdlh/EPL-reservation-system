const Match = require('../models/Match');
const Team = require('../models/Team');
const Stadium = require('../models/Stadium');

// calculate percentage or reservation of a certain match
const getPercentage = (lounge) => {
    let count = 0;
    lounge.forEach((row) => {
        row.forEach((element) => {
            if (element != null) {
            count ++;
            }
        })
    })
    return (count / (lounge.length * lounge[0].length))*100;
}
// details of all matches timing after now
const allMatches = async (req, res) => {
    const now = new Date();
    let response = [];
    const matches = await Match.find({time: {$gte: now}})
    .then((matches) => {
        let response = [];
        matches.forEach(async(element, i) => {
            let match = JSON.parse(JSON.stringify(element));
            await Team.findOne({name: element.home_team})
            .then((result) => {match.homeTeamLogo = result.logo});
            await Team.findOne({name: element.away_team})
            .then((result)=> match.awayTeamLogo = result.logo);
            match.reservationPercentage = getPercentage (match.lounge);
            delete match.lounge;
            delete match.createdAt;
            delete match.updatedAt;
            response.push(match);
            if(i == matches.length-1) {
                res.json({matches: response});
            }
        });
    });
}

// add a new match event by managers
const insert_match = async (req, res) => {
    const homeTeam = await Team.findOne({name: req.body.home_team});
    const awayTeam = await Team.findOne({name: req.body.away_team});
    if( !homeTeam || !awayTeam || homeTeam == awayTeam ) {
        res.status(400).json({msg: 'Invalid Teams!'});
        return;
    }
    const venue =  await Stadium.findOne({name: req.body.match_venue});
    if (!venue) {
        res.status(400).json({msg: 'Unknown Stadium!'});
        return;
    }
    if (req.body.time < new Date())  {
        res.status(400).json({msg: 'Invalid Time Slot!'});
        return;
    }
    let lounge = Array(venue.numRows);
    for (let i = 0; i < venue.numRows; i++) {
        lounge[i] = Array(venue.seats_per_row).fill(null);
    }
    req.body.lounge = lounge;
    await Match.create(req.body)
    .then((result) => res.json({msg: 'Added'}))
    .catch((err) => res.status(400).json(err.message));
}
module.exports = {
    allMatches,
    insert_match
};