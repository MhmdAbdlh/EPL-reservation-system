const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt');

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
    res.setHeader('Access-Control-Expose-Headers', 'jwt');
    try{
        const user = await User.login(req.body)
        //res.cookie('jwt', genToken(user._id), { httpOnly: false, maxAge: maxAge * 1000, sameSite: 'none', secure: true });
        res.setHeader('jwt', genToken(user._id));
        //res.setHeader('x-Trigger', 'CORS');
        //const jwt = genToken(user._id);
        res.json({ msg: 'logged_in'});
    }
    catch(err) {
        res.json({ msg: err.message});
    } 
}

// fetch profile info
const get_info = async (req, res) => {
     let user = JSON.parse(JSON.stringify(res.locals.user));
     delete res.locals.user;
     delete user._id;
     delete user.password;
     delete user.authenticated;
     res.json(user);
}

// update profile info
const edit_info = async (req, res) => {
    let user = JSON.parse(JSON.stringify(res.locals.user));
    delete res.locals.user;
    const auth = await bcrypt.compare(req.body.password, user.password);
    console.log(auth);
    delete req.body.password;
    if (!auth) {
        res.status(400).json({msg: "Wrong Password. Update Failed!"});
        return;
    }
    else {
        delete req.body.username;
        delete req.body.role;
        delete req.body.email;
        delete req.body.password;
        await User.findOneAndUpdate({ username: user.username }, req.body)
        .then((result) => res.json({msg: 'success'}))
        .catch((err) => res.status(400).json({msg: err.message}));
    }
}

// change authenticated user's password
const change_password = async (req, res) => {
    let user = JSON.parse(JSON.stringify(res.locals.user));
    delete res.locals.user;
    //let response = {msg: 'error', old_password: '', new_password: ''}
    const auth = await bcrypt.compare(req.body.old_password, user.password);
    if (!auth) {
        res.status(400).json({msg: 'error', old_password: "Wrong Password. Update Failed!", new_password: '', confirm: ''});
        return;
    }
    if(req.body.new_password !== req.body.confirm_new_password ) {
        res.status(400).json({msg: 'error', confirm: "Please re-confirm your password!", old_password: '', new_password: ''});
        return;
    }
    if (req.body.old_password === req.body.new_password) {
        res.status(400).json({msg: 'error', new_password: "New password cannot be exactly as the old one!", old_password: '', confirm: ''});
        return;
    }
    const userDoc = await User.findOne({ username: user.username });
    userDoc.password = req.body.new_password;
    await userDoc.save().then((result => res.json({msg: 'success'})))
    .catch((err) => res.status(400).json({msg: 'error', new_password: "Minimum password length is 8 characters", old_password: '', confirm: ''}));
}

// fetch all users whether pending or registered
const get_users = async (req, res) => {
    const type = req.query.type;
    if (type !== 'registered' && type !== 'pending') {
        res.status(400).json({msg: 'Invalid Request'});
        return;
    }
    const isRegistered = type === 'registered';
    await User.find({"authenticated": isRegistered}, {"_id": 0, "username": 1})
    .then((result) => res.json({users: result}))
    .catch((err) => res.status(400).json({users: err.message}));
}

// authenticate user given username
const authenticate = async (req, res) => {
    const username = req.body.username;
    await User.findOneAndUpdate({ username }, {authenticated: true})
    .then((result) => res.json({msg: 'authenticated'}))
    .catch((err) => res.status(400).json({msg: err.message}));
}

// delete user 
const delete_user = async (req, res) => {
    const username = req.body.username;
    await User.findOneAndDelete({ username })
    .then((result) => {
        if(result != null) {
            res.json({msg: 'deleted'});
        }
        else {
            throw Error('user not found');
        }
    })
    .catch((err) => res.status(400).json({msg: err.message}));
}
module.exports = {
    sign_up,
    log_in,
    get_info,
    edit_info,
    change_password,
    get_users,
    authenticate,
    delete_user
};