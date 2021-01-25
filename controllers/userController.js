const User = require('../models/User');
const jwt = require('jsonwebtoken');

// generate token utility function
const maxAge = 24 * 60 * 60;
const genToken = (id) => {
  return jwt.sign({ id }, 'MysecretEPL1', {
    expiresIn: maxAge
  });
};

// sign up
const sign_up = async (req, res) =>{
    req.body.authenticated = true;
    if(req.body.role === 'Manager'){
        req.body.authenticated = false;
    }
    let response = {msg: 'Invalid Request', username: '', email: '', password: ''}
    let registered = false;
    await User.create(req.body)
    .then((result) => {registered = true; response = {msg: 'registered', username: 'ok', email: 'ok', password: 'ok'}})
    .catch((err) => {
        console.log(err);
        response.msg = 'error';
        if(err.code === 11000){
            response.username = 'username is already taken';
        }
        if (err.message.includes('email')){
            response.email = 'Please enter a valid email';
        }
        if (err.message.includes('password')){
            response.password = 'Minimum password length is 8 characters';
        }   
    });
    if(registered){
        res.json(response);
    }
    else{
        res.status(400).json(response);
    } 
}

//log in
const log_in = async (req, res) =>{
    try{
        const user = await User.login(req.body)
        res.cookie('jwt', genToken(user._id), { httpOnly: true, maxAge: maxAge * 1000 });
        res.json({ msg: 'logged_in'});
    }
    catch(err) {
        res.json({ msg: err.message});
    } 
}

// fetch profile info
const get_info = async (req, res) =>{
     let user = JSON.parse(JSON.stringify(res.locals.user));
     delete res.locals.user;
     delete user._id;
     delete user.password;
     delete user.authenticated;
     res.json(user);
}
module.exports = {
    sign_up,
    log_in,
    get_info
};