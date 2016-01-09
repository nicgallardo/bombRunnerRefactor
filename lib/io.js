var io = require('socket.io')();
var db = require('monk')('localhost/bombroller-users');
var RoomBomb = db.get('room-bomb');
var RoomTarget = db.get('room-target');

io.on('connection', function (socket) {

  socket.on('createRoom', function(room){
    socket.room = room;
    socket.join(socket.room);

    RoomBomb.findOne({room: socket.room}, function(err, doc){
      if(doc === null){
        RoomTarget.insert({
          room: socket.room,
          targetCoord: {x: .5, y: .5}
        }, function(err,doc){
          console.log(socket.room);
          io.in(socket.room).emit('targetCoord', doc);
        })
      }
    })

  });

  socket.on('passCoord', function (data) {
    data.ballID = socket.id;
    socket.broadcast.emit('toAllButSender', data);
  });


  socket.on('userScored', function(data){
    var newTargetX = Number(Math.random().toFixed(2));
    var newTargetY = Number(Math.random().toFixed(2));
    RoomTarget.findOne({room: socket.room}, function(err, doc){
      doc.targetCoord = {x: newTargetX, y: newTargetY}
      RoomTarget.update({room: socket.room}, doc, function(err, doc){
      }).then(function() {
        /*
          RoomTarget find room and emit like below
        */
          // io.in(socket.room).emit('targetCoord', doc);
      })
    })
  })

});

module.exports = io;
