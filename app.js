const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRoutes');

// Server running
const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser());
//DB connection string
const dbURI = 'mongodb+srv://dbUser:EPL12345@cluster0.5kwd4.mongodb.net/EPL_Reservation_System?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then((result) => {console.log('Conected'); app.listen(3000)})
.catch((err) =>console.log(err));
const auth = require('./middleware/authMiddleware');
//app.get('/', auth.requireAuth, (req,res)=>res.send('<h1> 7ott /signup 2w /login msh h2olha tany</h1>'));
//app.use('*', auth.requireAuth);
app.get('/',  (req,res)=> res.send("swany yasta b3mel 7aga"));
app.use(userRouter);
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