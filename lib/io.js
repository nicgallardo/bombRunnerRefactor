var io = require('socket.io')();

io.on('connection', function (socket) {
  socket.on('passCoord', function (data) {
    data.ballID = socket.id;
    socket.broadcast.emit('toAllButSender', data);
  });
  // create target
  // iterate through sockets in the room and send those events
  var targetY = Number(Math.random().toFixed(2));
  var targetX = Number(Math.random().toFixed(2));
  io.emit('targetCoord',{y:targetY, x:targetX});
});

module.exports = io;
