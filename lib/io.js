var io = require('socket.io')();

io.on('connection', function (socket) {
  socket.on('passCoord', function (data) {
    data.ballID = socket.id;
    socket.broadcast.emit('toAllButSender', data);
  });
});

module.exports = io;
