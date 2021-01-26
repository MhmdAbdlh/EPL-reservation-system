const Stadium = require('../models/Stadium');

// list all stadiums
const allStadiums = async (req, res) => {
    const stadia = await Stadium.find({}, {"_id": 0, "createdAt": 0, "updatedAt": 0});
    res.json({'stadia': stadia});
}


// insert new stadium by managers
const insert_stadium = async (req, res) => {
    let response = {msg: 'error', name: '', numRows: '', seats: ''};
    await Stadium.create (req.body)
    .then((result) => response = {msg: 'Added', name: 'ok', numRows: 'ok', seats: 'ok'})
    .catch((err) => {
        response.msg = 'error';
        if(err.code === 11000) {
            response.name = 'Stadium name already exists!';
        }
        if(err.message.includes('numRows')) {
            response.numRows = 'Minimum number of rows is 3!';
        }
        if(err.message.includes('seats_per_row')) {
            response.seats = 'Minimum number of seats per row is 8!';
        }
    });
    if (response.msg === 'Added') {
        res.json(response);
    }
    else {
        res.status(400).json(response);
    }
}

module.exports = {
    allStadiums,
    insert_stadium
}