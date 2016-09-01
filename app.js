var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var FacebookStrategy = require('passport-facebook');
var passport = require('passport');
var session = require('express-session');
// var db = require('monk')('localhost/bombroller-users');
var db = require('monk')(process.env.MONGOLAB_URI);
var Users = db.get('users');
var Lobby = db.get('lobby');
var Points = db.get('points');

require('dotenv').load();
passport.authenticate();

var routes = require('./routes/index');

var app = express();

app.set('trust proxy', 1)

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

var userFirstName, userLastName, userFBid;

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    // callbackURL: "https://galaxybomber.herokuapp.com/auth/facebook/callback",
    enableProof: false,
    profileFields: ['id', 'displayName', 'link', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var fullName = profile.displayName.split(" "),
        userFirstName = fullName[0],
        userLastName = fullName[1],
        userFBid = profile.id,
        userPhoto = profile.photos[0].value;
    Users.findOne({ fbid: profile.id}).then(function(user){
        if(user == null){
          Users.insert({
            fbid: profile.id,
            firstname: userFirstName,
            lastname: userLastName,
            profilepic: userPhoto,
            wins: 0,
            explosions: 0,
            games: [],
          }, function (err, doc) {
            if (err) throw err;
          });
        }else{
          Users.findOne({fbid: profile.id}).on('success', function (doc) {
            done(null, { facebookId: profile.id, firstName: userFirstName, lastName: userLastName, token: accessToken });
          });
        }
    })
  }
));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/auth/facebook',
passport.authenticate('facebook'));

app.get('/logout', function(req, res){
  req.session = null;
  req.logout();
  res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use(passport.session());

app.get('/me', function(req, res){
  if (req.user) {
    Users.findOne({fbid: req.user.facebookId}).on('success', function(doc){
      res.json(doc)
    })
  } else {
    res.sendStatus(403)
  }
})

app.get('/api/v1/leader-board', function(req, res){
  Users.find({}, function(err, doc){
    res.json(doc)
  })
})

app.get('/api/v1/check-room/:room', function(req, res){
  Lobby.findOne({lobby: req.params.room}, function(err, doc){
    if(doc){
      console.log("doc")
      res.json({"result": true});

    }
    if(err) console.log("error : \n", err);
  });
})

app.get('/api/v1/all-points/:room', function(req, res){
  Points.find({gameName: req.params.room}, function(err, doc){
    if(doc) res.json(doc);
    if(err) console.log("error : \n", err);
  });
})

app.get('/api/v1/users-played/:room', function(req, res){
  Lobby.findOne({lobby: req.params.room}, function(err, doc){
    if(doc) res.json(doc.users);
    if(err) console.log("error : \n", err);
  });
})

app.post('/api/v1/add-game-point/:room', function (req, res) {
  Points.insert({
    gameName: req.params.room,
    userFbid: req.body.fbID,
    value: 1
  });
})

app.get('/api/v1/room-users/:id', function(req, res){
  console.log(req.params.id);
  Lobby.findOne({lobby: req.params.id}, function(err, doc){
    console.log("DOC : ", doc);

  }).then(function(){
    res.json(doc)
  })
})

// app.get('/api/v1/game-data/:id', function(req, res){
//   console.log(req.params.id);
//   Lobby.findOne({lobby: req.params.id}, function(err, doc){
//     console.log("DOC : ", doc);
//   }).then(function(){
//     res.json(doc)
//   })
// })
//BROKEN TODO
app.post('/api/v1/create-room/:id', function (req, res){
  var lobby = req.params.id;
  Users.update(
    {fbid: req.body.fbID},
    { $push:
      {
        games:lobby
      }
    },
    function(err, doc){
      console.log('err', err);
      console.log('doc', doc);
    }
  );
  Lobby.findOne({lobby: lobby}, function(err, doc){
    if(doc === null){
      Lobby.insert({
        lobby: lobby,
        users: [req.body]
      })
    }
  }).then(function(){
    Lobby.findOne({lobby: lobby}, function(err, doc){
      for (var i = 0; i < doc.users.length; i++) {
        if(doc.users == null || doc.users == undefined){
          console.log("ERR ____________________________");
        }else { //TODO the code below breaks and shuts down the server
          if(doc.users[i].fbid !== req.body.fbID){
            console.log("HIT THE IF");
            Lobby.update(
              { lobby: lobby },
              { $addToSet: { users: [req.body] } }
            ).then(function(){
              return res.sendStatus(200)
            })
          }
        }
      }
    })
  })
})

app.post('/api/v1/add-explosion', function (req, res) {
  Users.update(
   { fbid: req.user.facebookId},
   { $inc: { explosions: 1} }
 ).then(function(){
   res.redirect('/me');
 })
});

app.use('/', routes);

app.get('*', function(req, res){
  res.sendFile('index.html', { root: __dirname + '/public/' });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
