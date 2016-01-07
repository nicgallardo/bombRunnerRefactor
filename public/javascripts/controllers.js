app.controller('HomeController', ['$scope', function($scope) {

}]);
app.controller('PlayController', ['$scope', function($scope) {
  var x, y, coord = {};

  $scope.mouseTrack = function($event){
    var movesObj = {}
    movesObj.x = $event.clientY;
    movesObj.y = $event.clientX;
    $scope.myOutput = {x: movesObj.x, y: movesObj.y}
    socket.emit('passCoord', movesObj);

  };

  var socket = io();
  socket.on('toAllButSender', function (data) {
    $scope.$apply(function(){
      $scope.otherUsersData = data;

      var player = document.getElementById(data.ballID);

      if(player === null){
        var player = document.createElement("div");
        player.setAttribute("class", "ball");
        player.setAttribute("id", data.ballID);
        player.style.background = "black";
        document.querySelector('.board').appendChild(player);
      }else{
        player.style.top = data.x+"px";
        player.style.left = data.y+"px";
      }
    })
  });

}]);
