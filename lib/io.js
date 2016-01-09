var io = require('socket.io')();
var db = require('monk')('localhost/bombroller-users');
var RoomBomb = db.get('room-bomb');
var RoomTarget = db.get('room-target');

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
        io.in(socket.room).emit('targetCoord', doc);
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

});

module.exports = io;
