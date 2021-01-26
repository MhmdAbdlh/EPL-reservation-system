const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRoutes');
const matchRouter = require('./routes/matchRoutes');
const stadiumRouter = require('./routes/stadiumRoutes');
const teamRouter = require('./routes/teamRoutes');
const cors = require('cors');
// Server running
const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser());
//app.use(session({cookie: { secure: false}}));
app.use(cors({credentials: true}));
//DB connection string
const dbURI = 'mongodb+srv://dbUser:EPL12345@cluster0.5kwd4.mongodb.net/EPL_Reservation_System?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
.then((result) => {console.log('Conected'); app.listen(3000)})
.catch((err) =>console.log(err));

app.get('/',  (req,res)=> res.send("<h1> Use internal routes instead. Thanks!</h1>"));
app.use(userRouter);
app.use('/matches', matchRouter);
app.use('/stadia', stadiumRouter);
app.use('/teams', teamRouter);
const d = new Date(1998, 4, 29);
app.get('/hkjh', (req, res) => {
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