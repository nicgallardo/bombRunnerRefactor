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
    console.log("settingHeight");
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
    var movesObj = {}
    movesObj.x = $event.offsetY
    movesObj.y = $event.offsetX
    socket.emit('passCoord', movesObj);
    playerMoves(movesObj);
  };

  function playerMoves(movesObject) {
    var firstPerson = document.getElementById("firstPerson")
    if(firstPerson === null){
      var firstPerson = document.createElement("div");
      firstPerson.setAttribute("class", "ball");
      firstPerson.setAttribute("id", "firstPerson");
      firstPerson.style.background = colors[Math.floor(Math.random()* 14)-1];
      document.querySelector('.board').appendChild(firstPerson);
    }else{
      var top = movesObject.x
      var left = movesObject.y

      var maxTop = state.window.gameWindow - firstPerson.offsetHeight;
      var maxLeft = state.window.gameWindow - firstPerson.offsetWidth;

      firstPerson.style.top = Math.min(top, maxTop)+"px";
      firstPerson.style.left = Math.min(left, maxLeft)+"px";
    }
  }

  var socket = io();
  socket.on('toAllButSender', function (data) {
    $scope.$apply(function(){
      $scope.otherUsersData = data;

      var player = document.getElementById(data.ballID);

      if(player === null){
        var player = document.createElement("div");
        var colors = ["#4cb7db", "#fff8b0", "#c4fcdd", "#ffb6c1", "#660066", "#f6546a", '#b32500', '#8dc63f', '#114355', '#794044', '#ca8f42', '#6a7d8e', '#00ffff', '#ff7373']
        player.setAttribute("class", "ball");
        player.setAttribute("id", data.ballID);
        player.style.background = colors[Math.floor(Math.random()* 14)-1];
        document.querySelector('.board').appendChild(player);
      }else{
        player.style.top = data.x+"px";
        player.style.left = data.y+"px";
      }
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
