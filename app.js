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
var db = require('monk')('localhost/bombroller-users');
// var db = require('monk')(process.env.PROD_MONGODB);
var Users = db.get('users');
var Lobby = db.get('lobby');

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
            points: 0,
            wins: 0,
            explosions: 0
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

app.post('/api/v1/add-point', function (req, res) {
  Users.update(
   { fbid: req.user.facebookId},
   { $inc: { points: 1} }
  )
  res.redirect('/me');
});
// db.collection.update( {"players.playerName":"Joe"}, { $inc : { "players.$.playerScore" : 1 } }
app.post('/api/v1/add-game-point', function (req, res) {
  Lobby.update(
      {lobby: req.body.lobbyName, users:{ $elemMatch: {fbID: req.body.fbID}}},
      { $inc: {"users.$.points": 1}}
    ).then(function () {
      res.json({})
    })
})

app.get('/api/v1/room-users/:id', function(req, res){
  console.log(req.params.id);
  Lobby.findOne({lobby: req.params.id}, function(err, doc){
    console.log("DOC : ", doc);
    res.json(doc)
  })
})
//BROKEN TODO
app.post('/api/v1/create-room/:id', function (req, res){
  var lobby = req.params.id;
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
        console.log(doc.users[i].fbID);
        if(doc.users == null || doc.user == undefined){
          console.log("ERR");
        }else { //TODO the code below breaks and shuts down the server
          if(doc.users[i].fbID.indexOf(req.body.fbID) == -1){
            console.log("HIT THE IF");
            Lobby.update(
              { lobby: lobby },
              { $addToSet: { users: [req.body] } }
            )
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
  )
  res.redirect('/me');
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
