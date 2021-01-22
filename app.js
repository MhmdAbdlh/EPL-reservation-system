const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User.js');
const Match = require('./models/Match.js');
// Server running
const app = express();

//DB connection string
const dbURI = 'mongodb+srv://dbUser:EPL12345@cluster0.5kwd4.mongodb.net/EPL_Reservation_System?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => {console.log('Conected'); app.listen(3000)})
.catch((err) =>console.log(err));

const d = new Date(1998, 4, 29);
app.get('/', (req, res) => {
    const R = 3, C = 4;
    const val = 'null';
    var arr = Array(R);
    for (var i = 0; i < R; i++) {
        arr[i] = Array(C).fill(val);
    }
    match = new Match({
        home_team: 'Ahly',
        away_team: 'Pyramids',
        match_venue: 'Cairo Stadium',
        time: d,
        referee: 'hjk',
        linesman1: 'hjjh',
        linesman2: 'jhbj',
        lounge: arr
    })
    match.save()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});