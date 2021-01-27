const Match = require('../models/Match');
const Team = require('../models/Team');
const Stadium = require('../models/Stadium');
const Reservation = require('../models/Reservation');

// utility function, calculate percentage or reservation of a certain match
const getPercentage = (lounge) => {
    let count = 0;
    lounge.forEach((row) => {
        row.forEach((element) => {
            if (element !== 'null') {
            count ++;
            }
        })
    })
    return (count / (lounge.length * lounge[0].length))*100;
}

// utility function for parsing matches
const prepareMatches = (matches, res) => {
    let response = [];
    if (matches.length == 0) {
        res.json({matches: response});
        return;
    }
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
}

const daysDiff = (matchDate, cancellationDate) => {
    const diff = matchDate - cancellationDate;  // difference in millisecondsd
    return (diff / (1000*60*60*24));  //difference in days
}

// details of all matches timing after now
const allMatches = async (req, res) => {
    const now = new Date();
    const matches = await Match.find({time: {$gte: now}})
    .then((matches) => {
        prepareMatches(matches, res);
    });
}

// details of matches of authorised user only
const myMatches = async (req, res) => {
    let user = JSON.parse(JSON.stringify(res.locals.user));
    delete res.locals.user;
    const now = new Date();
    const matches = await Match.find({time: {$gte: now}, lounge:{$elemMatch: {$elemMatch: {$in: [user._id]}}}})
    .then((matches) => {
        prepareMatches(matches, res);
    })
    .catch((err) => res.status(400).json(err.msg));
}

// uility function for validating match details in add or edit
const validate_request = async (req, res) => {
    const homeTeam = await Team.findOne({name: req.body.home_team});
    const awayTeam = await Team.findOne({name: req.body.away_team});
    if( !homeTeam || !awayTeam || homeTeam == awayTeam ) {
        res.status(400).json({msg: 'Invalid Teams!'});
        return false;
    }
    const venue =  await Stadium.findOne({name: req.body.match_venue});
    if (!venue) {
        res.status(400).json({msg: 'Unknown Stadium!'});
        return false;
    }
    const matchTime = new Date(req.body.time);
    if (matchTime.getTime() < new Date().getTime())  {
        res.status(400).json({msg: 'Invalid Time Slot!'});
        return false;
    }
    return venue;
}

// add a new match event by managers
const insert_match = async (req, res) => {
    const venue = await validate_request(req, res);
    if (!venue) {
        return;
    }
    let lounge = Array(venue.numRows);
    for (let i = 0; i < venue.numRows; i++) {
        lounge[i] = Array(venue.seats_per_row).fill('null');
    }
    req.body.lounge = lounge;
    await Match.create(req.body)
    .then((result) => res.json({id: result._id}))
    .catch((err) => res.status(400).json(err.message));
}

// edit an exisiting match by managers
const edit_match = async (req, res) => {
    const id = req.body._id;
    delete req.body._id;
    const match = Match.findById(id)
    .then(async(result) => {
        if(!result) {
            throw Error('Not Found!')
        }
        if (getPercentage(result.lounge) > 0) {
            res.status(400).json({msg: "You cannot edit this match. Some tickets are already sold!"});
            return;
        }
        const venue = await validate_request(req, res);
        if (!venue) {
            return;
        }
        const update = await Match.findByIdAndUpdate(id, req.body)
        .then((result) => {
            if(!result) {
                throw Error('Not Found');
            }
            res.json({msg: 'Updated'})
        })
        .catch((err) => res.status(400).json({msg: err.message}));
    })
    .catch((err) => res.status(400).json({msg: err.message}));
}

// get the grid shape of a match
const get_grid = async (req, res) => {
    let user = JSON.parse(JSON.stringify(res.locals.user));
    delete res.locals.user;
    const matchID = req.body.matchID;
    const userID = user._id;
    const matches = await Match.findOne({"_id": matchID}, {"lounge": 1})
    .then((matches) => {
        const lounge = matches.lounge;
        let response = Array(lounge.length);
        for (let i = 0; i < lounge.length; i++) {
            response[i] = Array(lounge[i].length);
            for (let j = 0; j < response[i].length; j++) {
                if (lounge[i][j] === 'null'){
                    response[i][j] = 0;
                }
                else if (lounge[i][j] === userID) {
                    response[i][j] = 1;
                }
                else {
                    response[i][j] = -1;
                }
            }
        }
        res.json({id: matches._id, grid: response});
    })
    .catch((err) => res.status(400).json({grid: 'Invalid Request'}))
}

// reserve one or more seats for a certain match
const reserve = (req, res) => {
    const user = JSON.parse(JSON.stringify(res.locals.user));
    const userID = user._id;
    const matchID = req.body.matchID;
    let match = Match.findById(matchID)
    .then((match) => {
        if (!match) {
            throw Error('Match not found!');
        }
        const seats = req.body.seats;
        // TODO: check if any of the seats is taken
        //   if so, return error
        //   if not, mark them as reserved
        Reservation.create(reservation)
        .then((result) => {
            res.json({
                id: result._id
            });
        })
        .catch((err) => {
            res.status(400).json({
                msg: err.message
            });
        });
    })
}

// cancel a reservation
const cancelReservation = (req, res) => {
    const reservationID = req.body.id;
    const user = JSON.parse(JSON.stringify(res.locals.user));
    const userID = user._id;
    const matchID = req.body.matchID;
    const reservation = Reservation.findById(reservationID)
    .then((reservation) => {
        if (!reservation) {
            throw Error('Reservation not found!');
        }
        const cancellationDate = new Date();
        const match = Match.findById(matchID);
        const matchDate = new Date(match.time);
        if (daysDiff(matchDate, cancellationDate) >= 3) {
            Reservation.findOneAndDelete({'_id': reservationID})
            .then((result) => {
                if (result != null) {
                    res.json({
                        msg: 'cancelled'
                    });
                    // TODO: mark seats as vacant
                }
                else {
                    res.json({
                        msg: 'failed to cancel'
                    });
                }
            })
            .catch((err) => {
                res.status(400).json({msg: err.message})
            });
        }
        else {
            res.json({
                msg: 'Too late to cancel.'
            })
        }
    })
}

module.exports = {
    allMatches,
    myMatches,
    insert_match,
    edit_match, 
    get_grid,
    reserve,
    cancelReservation
};