var io = require('socket.io')();
var _ = require('lodash');
var db = require('monk')('localhost/bombroller-users');
// var db = require('monk')(process.env.MONGOLAB_URI);
var RoomBombs = db.get('room-bomb');
var RoomTarget = db.get('room-target');
var Users = db.get('users');
var Lobby = db.get('lobby');
var Points = db.get('points');


io.on('connection', function(socket){
  socket.on('createLobby', function(room){
    socket.room = room;
    socket.join(socket.room);
  })

  socket.on('getUsers', function(lobby){
    Lobby.findOne({lobby: lobby}, function(err, doc){
      io.in(socket.room).emit('showUsers', doc);
    })
  })

  socket.on('lobbyChat', function(chatObj){
    io.in(socket.room).emit('addChat', chatObj);
  })

  socket.on('changeLocation', function(data){
    io.in(socket.room).emit('changeAllUsersLocation', data);
  })

})


io.on('connection', function (socket) {

  socket.on('createRoom', function(room){
    socket.room = room;
    socket.join(socket.room);
    RoomTarget.findOne({room: room}, function(err, doc){
      if(doc === null){//excutes code when the first player joins not again
        RoomTarget.insert({
          room: socket.room,
          targetCoord: {x: .5, y: .5}
        }, function(err,doc){
          io.in(socket.room).emit('targetCoord', doc);
        })
      }else{//excutes code for target when a new user joins and a 1st player has already joined
        io.in(socket.room).emit('targetCoord', doc);//threw an odd error once TODO
      }
    })
  });

  socket.on('passCoord', function (data) {
    data.ballID = socket.id;
    // below sends socket info to all pople in single room but the
    //firstperson client//
    socket.broadcast.to(socket.room).emit('toAllButSender', data);

  });


  socket.on('userScored', function(data){
    console.log('data : ', data);
    var newTargetX = Number(Math.random().toFixed(2));
    var newTargetY = Number(Math.random().toFixed(2));
    RoomTarget.findOne({room: socket.room}, function(err, doc){
      doc.targetCoord = {x: newTargetX, y: newTargetY}
      RoomTarget.update({room: socket.room}, doc, function(err, doc){
      }).then(function() {
        RoomTarget.findOne({room: socket.room}, function(err, doc){
          //below sends socket info to all the users including the
          //first peerson client //
          io.in(socket.room).emit('targetCoord', doc);
        })
      })
    })
  })

  socket.on('createBomb', function(data){
    var newBombX = Number(Math.random().toFixed(2));
    var newBombY = Number(Math.random().toFixed(2));
    RoomBombs.findOne({room: socket.room}, function(err, doc){
      if(doc === null){
        RoomBombs.insert({
          room: socket.room,
          bombs: [[newBombX, newBombY]]
        }, function(err, doc){
          io.in(socket.room).emit('bombsToDom', doc)
        })
      }else{
        // RoomBombs.findOne({room: socket.room})
        RoomBombs.update(
          { room: socket.room },
          { $addToSet: { bombs: [newBombX, newBombY] } }
        ).then(function(){
          RoomBombs.findOne({room: socket.room}, function(err, doc){
            io.in(socket.room).emit('bombsToDom', doc)
          })
        })
      }
    })
  })

  RoomTarget.findOne({room: socket.room}, function(err, doc){
    if(doc === null){//excutes code when the first player joins not again
      RoomTarget.insert({
        room: socket.room,
        targetCoord: {x: .5, y: .5}
      }, function(err,doc){
        io.in(socket.room).emit('targetCoord', doc);
      })
    }else{//excutes code for target when a new user joins and a 1st player has already joined
      io.in(socket.room).emit('targetCoord', doc);//threw an odd error once keep an eye out
    }
  })





  socket.on('updateTickerScore', function(data, room){
    var points = new Promise(function(res, rej){
      Points.find({gameName: room}, function(err, doc){
        if(doc) res(doc)
        if(err) rej(err)
      })
    });

    var users = new Promise(function(res, rej){
      Lobby.findOne({lobby: room}, function(err, doc){
        if(doc) res(doc.users);
        if(err) rej(err);
      });
    });
    Promise.all([points, users]).then(function(values){
      var userPoints = [];
      var _points = values[0];
      var _users = values[1];
      _.each(_users, function(user){
        var tmpPoints = _.filter(_points, function(point) {
          return point.userFbid === user.fbID
        });
        var tmpObj = {
          userName: user.userName,
          pic: user.profilepic,
          points: tmpPoints.length
        };
        userPoints.push(tmpObj);
      })
      io.in(socket.room).emit('domTickerScore', data, userPoints);
    });
  })

  socket.on('playerExplode', function(data){
    var ballId = socket.id;
    socket.broadcast.to(socket.room).emit('removeSocketPlayer', ballId);
    io.in(socket.room).emit('domTickerExplode', data);
  })


});

module.exports = io;
