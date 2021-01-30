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
    matches.forEach(async(element) => {
        let match = JSON.parse(JSON.stringify(element));
        await Team.findOne({name: element.home_team})
        .then((result) => {match.homeTeamLogo = result.logo});
        await Team.findOne({name: element.away_team})
        .then((result)=> match.awayTeamLogo = result.logo);
        match.reservationPercentage = Math.round(getPercentage (match.lounge));
        delete match.lounge;
        delete match.createdAt;
        delete match.updatedAt;
        delete match.__v;
        response.push(match);
        if(response.length == matches.length) {
            res.json({matches: response});
        }
    });
}

// calc difference between two dates in days
const daysDiff = (matchDate, cancellationDate) => {
    const diff = matchDate - cancellationDate;  // difference in millisecondsd
    return (diff / (1000*60*60*24));  //difference in days
}

// get the row of the seat and the index of the seat in the row from the seat ID 
const parseSeat = async (seat, matchID) => {
    const match = await Match.findById(matchID)
    .then((match) => {
        if (!match) {
            throw Error('Match not found!');
        }
        return match;
    })
    .catch((err) => {
        throw err;
    });
    
    const venue = await Stadium.findOne({name: match.match_venue})
    .then((venue) => {
        if (!venue) {
            throw Error(`Venue not found!!`);
        }
        return venue;
    })
    .catch((err) => {
        throw err;
    });
    
    const venueRows = venue.numRows;
    const venueSPR = venue.seats_per_row;

    const seatRow = Math.floor(seat / venueSPR);
    const seatNo = seat % venueSPR;

    if (seatRow >= venueRows) {
        throw Error('Invalid seat!');
    }

    return { lounge: match.lounge, seatRow, seatNo };
}

// Update the lounge
const updateLounge = async (matchID, seatRow, seatNo, userID) => {
    const lounge = await Match.findById(matchID)
    .then((match) => {
        if (!match) {
            throw Error('Match not found..');
        }
        return match.lounge;
    })
    .catch((err) => {
        throw err;
    });
    lounge[seatRow][seatNo] = userID;
    await Match.findOneAndUpdate({_id: matchID}, {lounge: lounge});
}

// details of all matches timing after now
const allMatches = async (req, res) => {
    const now = new Date();
    const matches = await Match.find({time: {$gte: now}}).sort({'time': -1})
    .then((matches) => {
        prepareMatches(matches, res);
        // res.json(matches);
    });
}

// details of matches of authorised user only
const myMatches = async (req, res) => {
    let user = JSON.parse(JSON.stringify(res.locals.user));
    delete res.locals.user;
    const now = new Date();
    const matches = await Match.find({time: {$gte: now}, lounge:{$elemMatch: {$elemMatch: {$in: [user._id]}}}}).sort({'time': -1})
    .then((matches) => {
        prepareMatches(matches, res);
    })
    .catch((err) => res.status(400).json(err.msg));
}

// details of a certain match given its ID
const matchInfo = async (req, res) => {
    const id = req.params.id;
    const match = await Match.findById(id)
    .then((match) => {
        if (!match) {
            throw Error('Match not found');
        }
        const tempList = [match];
        prepareMatches(tempList, res);
    })
    .catch((err) => {
        res.status(400).json({
            msg: err.message
        })
    });
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
    let lowerLimit = new Date(req.body.time);
    let upperLimit = new Date(req.body.time);
    lowerLimit.setHours(lowerLimit.getHours() - 2);
    upperLimit.setHours(upperLimit.getHours() + 2);
    const isReserved = await Match.findOne({match_venue: venue.name, time: {$lte: upperLimit}, time: {$gte: lowerLimit}});
    if (isReserved && req._id && req._id != isReserved._id) {
        res.status(400).json({msg: 'Stadium is unAvaialble on this time!'});
        return false;
    }
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
        const venue = await validate_request(req, res);
        if (!venue) {
            return;
        }
        if(result.match_venue != req.body.match_venue && getPercentage(result.lounge) > 0)
            res.status(400).json({msg: "You cannot edit match venue while some tickets are already sold!"});
        else {
            await Match.findByIdAndUpdate(id, req.body)
            .then((result) => res.json({msg: 'Updated'}))
            .catch((err)=> res.status(400).json({msg: "error"}));   
        }   
    })
    .catch((err) => res.status(400).json({msg: err.message}));
}

// get the grid shape of a match
const get_grid = async (req, res) => {
    let user = JSON.parse(JSON.stringify(res.locals.user));
    delete res.locals.user;
    const matchID = req.query.matchId;
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
        res.json({grid: response});
    })
    .catch((err) => res.status(400).json({grid: 'Invalid Request'}))
}

// Reserve one or more seats for a certain match
const reserve = async (req, res) => {
    try {
        const user = JSON.parse(JSON.stringify(res.locals.user));
        const userID = user._id;
        const matchID = req.body.matchId;
        const seat = parseInt(req.body.seatId);
        const CCN = req.body.creditNo;
        const PIN = req.body.pin;
        const { lounge, seatRow, seatNo } = await parseSeat(seat, matchID);
        
        // Seat should be vacant
        if (lounge[seatRow][seatNo] !== 'null') {
            throw Error('Seat is already taken');
        }

        // The same user should not have another reservation for a DIFFERENT match within 2 hours of this match
        const matchDate = await Match.findById(matchID).then((match) => { return new Date(match.time); });
        const lowerLimit = new Date(matchDate.getTime() - (2*60*60*1000));
        const upperLimit = new Date(matchDate.getTime() + (2*60*60*1000));    
        await Match.aggregate([
            {$project:{
                _id: { "$toString": "$_id" },
                time: 1
            }},
            {$lookup:{
                'from': Reservation.collection.name,
                'localField': '_id',
                'foreignField': 'matchID',
                'as': 'bookings'
            }},
            {$match:{
                'bookings.userID': userID,
                'bookings.matchID': {$ne: matchID},
                'time': {
                    $lt: upperLimit,
                    $gte: lowerLimit
                }
            }}
        ])
        .then((result) => {
            if (result.length > 0) {
                throw Error('Cannot reserve seats at 2 different games within 2 hours of each other.');
            }
        });

        // Valid reservation
        const reservation = {
            userID,
            matchID,
            CCN,
            PIN,
            seatRow,
            seatNo
        };
        Reservation.create(reservation)
        .then(async (result) => {
            await updateLounge(matchID, seatRow, seatNo, userID);
            res.json({
                ticketId: result._id
            });
        });
    }
    catch(err) {
        res.status(400).json({msg: err.message});
    }
}

// Cancel a reservation
const cancelReservation = async (req, res) => {
    try {
        const user = JSON.parse(JSON.stringify(res.locals.user));
        const userID = user._id;
        const matchID = req.body.matchId;
        const seat = parseInt(req.body.seatId);

        const { seatRow, seatNo } = await parseSeat(seat, matchID);

        // The reservation data should match those stored 
        const filter = {userID, matchID, seatRow, seatNo};
        const reservation = await Reservation.findOne(filter)
        .then(async (reservation) => {
            if (!reservation) {
                throw Error('Reservation not found!');
            }
        });
        
        // Cannot cancel a reservation less than 3 days before the match starts
        const cancellationDate = new Date();
        const match = await Match.findById(matchID).then((match) => { return match; });
        const matchDate = match.time;
        if (daysDiff(matchDate, cancellationDate) < 3) {
            throw Error('Too late to cancel.');
        }
        
        // Cancellation valid
        Reservation.findOneAndDelete(filter)
        .then(async (result) => {
            if (result != null) {
                await updateLounge(matchID, seatRow, seatNo, 'null');
                res.json({
                    msg: 'Reservation cancelled'
                });
            }
            else {
                throw Error('Failed to cancel reservation');
            }
        });
    }
    catch(err) {
        res.status(400).json({msg: err.message});
    };
}

module.exports = {
    allMatches,
    myMatches,
    matchInfo,
    insert_match,
    edit_match, 
    get_grid,
    reserve,
    cancelReservation
};