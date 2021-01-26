const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const isAuth = async (token) => {
    let auth = '', msg = '';
    if (token) {
        jwt.verify(token, 'MysecretEPL1', (err, decodedToken) => {
          if (err) {
            auth = false;
            msg = 'UnAuthorised user!';
          } else {
              try {
                User.findById(decodedToken.id);
                auth = true;
                msg = decodedToken.id;
              }
              catch(err){
                  auth = false;
                  msg = 'user not found!';
              }
          }
        });
      } else {
          auth = false;
          msg = 'Invalid Request!';
      }
      if (auth){
           await User.findById(msg)
          .then((result) => msg = result);
      }
      return {auth, msg};
}

// are you autheticated?
const requireAuth = (req, res, next) => {
    if (!req.cookies || !req.cookies.jwt){
        res.status(401).json({msg: 'UnAuthorized'});
    }
    else{
        const authInfo = isAuth(req.cookies.jwt);
        authInfo.then((result) => {
            if (!result.auth){
                res.status(401).json({msg: result.msg});
            }
            else {
                res.locals.user = result.msg;
                next();
            }
        })
        .catch((err) => console.log(err));
    }  
}

// are you a manager?
const requireManager= (req, res, next) => {
    if (!req.cookies || !req.cookies.jwt){
        res.status(401).json({msg: 'UnAuthorized'});
    }
    else{
        const authInfo = isAuth(req.cookies.jwt);
        authInfo.then((result) => {
            if (!result.auth){
                res.status(401).json({msg: result.msg});
            }
            else if(result.msg.role === 'Manager' && result.msg.authenticated == true) {
                //res.locals.user = result.msg;
                next();
            }
            else {
                res.status(403).json({msg: 'UnAuthorised user!'});
            }
        })
        .catch((err) => console.log(err));
    }  
}

// are you the site Admin?
const requireAdmin= (req, res, next) => {
    if (!req.cookies || !req.cookies.jwt){
        res.status(401).json({msg: 'UnAuthorized'});
    }
    else{
        const authInfo = isAuth(req.cookies.jwt);
        authInfo.then((result) => {
            if (!result.auth){
                res.status(401).json({msg: result.msg});
            }
            else if(result.msg.role === 'SA') {
                //res.locals.user = result.msg;
                next();
            }
            else {
                res.status(403).json({msg: 'UnAuthorised user!'});
            }
        })
        .catch((err) => console.log(err));
    }  
}
module.exports = {
    requireAuth,
    requireManager,
    requireAdmin
}