app.controller('HomeController', ['$scope', function($scope) {

}]);
app.controller('PlayController', ['$scope', '$window', function($scope, $window) {
  var state = {
    window: {
      gameWindow: null,

      setGameWindow: function (){
        state.window.gameWindow = window.innerWidth/2;
      }
    }
  }

  state.window.setGameWindow();

  $window.onresize = windowChange;

  var colors = ["#4cb7db", "#fff8b0", "#c4fcdd", "#ffb6c1", "#660066", "#f6546a", '#b32500', '#8dc63f', '#114355', '#794044', '#ca8f42', '#6a7d8e', '#00ffff', '#ff7373']
  $scope.backgroundPicked = function(pickBackground){
    if(pickBackground === "garden") $scope.boardStyle = {"background-color": "green", 'width': state.window.gameWindow + 'px', 'height': state.window.gameWindow + 'px'};
    if(pickBackground === "space") $scope.boardStyle = {"background-color": "black", 'width': state.window.gameWindow + 'px', 'height': state.window.gameWindow + 'px'};
  }


  function windowChange() {
    state.window.gameWindow = window.innerWidth/2;
    $scope.trackStyle = {'width': state.window.gameWindow + 'px', 'height': state.window.gameWindow + 'px'}
    $scope.boardStyle = {'width': state.window.gameWindow + 'px', 'height': state.window.gameWindow + 'px'}
  }

  var windowSize = state.window.gameWindow;
  $scope.trackStyle = {'width': windowSize + 'px', 'height': windowSize + 'px'}
  $scope.boardStyle = {'width': windowSize + 'px', 'height': windowSize + 'px'}

  var x, y, coord = {};


  $scope.mouseTrack = function($event){
    console.log('event', $event.clientY, $event.clientX);
    var movesObj = {}
    movesObj.x = $event.offsetY
    movesObj.y = $event.offsetX
    console.log(movesObj);
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
      console.log("movesObject: ", movesObject);
      // $('#firstPerson').offset({top: movesObject.x, left: movesObject.y})
      // /$("#firstPerson").css("top:" + movesObject.x+"px, left:" + movesObject.y+"px");
      firstPerson.style.top = movesObject.x+"px";
      firstPerson.style.left = movesObject.y+"px";
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
    var targetDomX = Math.floor(window.innerWidth/2 * targetLogicData.x);
    var targetDomY = Math.floor(window.innerWidth/2 * targetLogicData.y);

    $scope.targetStyle = {'top': targetDomX + 'px', 'left': targetDomY + 'px'}
  }
}]);
