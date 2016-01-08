app.controller('HomeController', ['$scope', function($scope) {

}]);
app.controller('PlayController', ['$scope', '$window', '$timeout', function($scope, $window, $timeout) {
  var state = {
    window: {
      gameWindow: null,
      setGameWindow: function (){
        state.window.gameWindow = window.innerWidth/2;
      }
    }
  }
  state.window.setGameWindow();

  $window.onresize = setHeight;
  setHeight();
  function setHeight() {
    $timeout(function () {
      state.window.setGameWindow();
      $scope.trackStyle = {'height': state.window.gameWindow + 'px'}
      $scope.boardStyle = {'height': state.window.gameWindow + 'px'}
    }, 0)
  }

  var colors = ["#4cb7db", "#fff8b0", "#c4fcdd", "#ffb6c1", "#660066", "#f6546a", '#b32500', '#8dc63f', '#114355', '#794044', '#ca8f42', '#6a7d8e', '#00ffff', '#ff7373']
  $scope.backgroundPicked = function(pickBackground){
    if(pickBackground === "garden") $scope.boardStyle['background-color'] = "green";
    if(pickBackground === "space") $scope.boardStyle["background-color"] = "black";
  }

  var x, y, coord = {};
  $scope.mouseTrack = function($event){
    var movesObj = {ballID: "firstPerson"}
    movesObj.y = $event.offsetY
    movesObj.x = $event.offsetX
    socket.emit('passCoord', movesObj);
    playerMoves(movesObj);
  };

  function playerMoves(data) {
    var ball = document.getElementById(data.ballID)
    if(ball === null){
      var ball = document.createElement("div");
      ball.setAttribute("class", "ball");
      ball.setAttribute("id", data.ballID);
      ball.style.background = colors[Math.floor(Math.random()* 14)-1];
      document.querySelector('.board').appendChild(ball);
    }else{
      var top = data.y
      var left = data.x

      var maxTop = state.window.gameWindow - ball.offsetHeight;
      var maxLeft = state.window.gameWindow - ball.offsetWidth;

      ball.style.top = Math.min(top, maxTop)+"px";
      ball.style.left = Math.min(left, maxLeft)+"px";
    }
  }

  var socket = io();
  socket.on('toAllButSender', function (data) {
    $scope.$apply(function(){
      $scope.otherUsersData = data;
      playerMoves(data)
    })
  });

  socket.on('targetCoord', function(data){
    $scope.$apply(function(){
      targetLogic(data);
    })
  })


  function targetLogic(targetLogicData){
    // location
    // var targetDomX = Math.floor(window.innerWidth/2 * targetLogicData.x);
    // var targetDomY = Math.floor(window.innerWidth/2 * targetLogicData.y);
    // //create
    // var target = document.createElement("div");
    // target.setAttribute("class", "target");
    // target.style.background = "red";
    // target.style.top = targetDomX + "px";
    // target.style.left = targetDomY + "px";
    // console.log('targetDom', targetDomX, targetDomY);
    // document.querySelector('.board').appendChild(target);

  }
}]);
