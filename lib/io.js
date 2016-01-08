var io = require('socket.io')();

io.on('connection', function (socket) {
  socket.on('passCoord', function (data) {
    data.ballID = socket.id;
    socket.broadcast.emit('toAllButSender', data);
  });
  //create target
  var targetX = Number(Math.random().toFixed(2));
  var targetY = Number(Math.random().toFixed(2));
  io.emit('targetCoord',{x:targetX, y:targetY});
});

module.exports = io;
