const express = require('express');
const router = express.Router();
const db = require('../db/index.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');

// helpful links 
// http://toon.io/understanding-passportjs-authentication-flow/
// https://github.com/jwalton/passport-api-docs#functions-added-to-the-request
// https://github.com/passport/todos-express-password/blob/master/routes/auth.js


passport.use(new LocalStrategy(function verify(username, password, done) {
  //done() is passport.authenticate
  db.query('SELECT * FROM users WHERE username = $1', [ username ], function(err, result) {
    if (err) { 
      return done(err); 
    }

    const row = result.rows[0];

    if (!row) { 
      return done(null, false, { message: 'Incorrect username or password.' }); 
    }
    //console.log(row);
    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) {
         return done(err); 
        }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      return done(null, row);
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, {username: user.username});
});

passport.deserializeUser((user, done) => {
  //user parameter comes from req.session.passport.user
  done(null, user);
});

//may add options/callback here depending on what to do on fail or pass
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err){
      return next(err);
    }
    if(!user){
      res.sendStatus(401);
    }
    else{
      req.login(user, function(err) {
        if (err) {
          return next(err); 
        }
        //res.redirect('/');
        res.sendStatus(200);
      });
      //res.sendStatus(200);
    }
    //call req.login instead of sendStatus(200) on authentication success
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err); 
    }
    //send some kind of res to client and go back to login page
    res.redirect('/');
  });
});

router.post('/signup', function(req, res, next) {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }
    db.query('INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3)', 
    [req.body.username, hashedPassword, salt], 
      function(err) {
      if (err) { 
        return next(err); 
      }
      const user = {
        //id: this.lastID,
        username: req.body.username
      };
      req.login(user, function(err) {
        if (err) {
          return next(err); 
        }
        //res.redirect('/');
        res.sendStatus(200);
      });
      //req.login(user, next);
    });
  });
});

module.exports = router;