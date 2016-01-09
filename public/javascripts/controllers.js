app.controller('HomeController', ['$scope', function($scope) {
  $scope.update = function(gameRoomName) {
    $scope.roomName = gameRoomName;
  };
}]);

app.controller('NavController', ['$scope', '$window', '$http', function($scope, $window, $http) {
    var findBrowser = $window.navigator.userAgent;

    $http.get('/me').then(function(response){
      localStorage.setItem('fbID', response.data.fbid);
      localStorage.setItem('firstName', response.data.firstname);
      localStorage.setItem('lastName', response.data.lastname);
      localStorage.setItem('profilepic', response.data.profilepic);
      localStorage.setItem('points', response.data.points)
      $scope.userName = localStorage.getItem("firstName");

    }, function (err) {
      localStorage.removeItem('fbID');
      localStorage.removeItem('firstName');
      localStorage.removeItem('points');
      $scope.userName = null;

    })
}]);

app.controller('PlayController', ['$scope', '$window', '$timeout', '$location', '$http', function($scope, $window, $timeout, $location, $http) {
  var state = {
    window: {
      gameWindow: null,
      setGameWindow: function (){
        state.window.gameWindow = window.innerWidth/2;
      }
    },
    game: {

      targetLocation: null,

      targetLocationCreate: function (data){
        state.game.targetLocation = data;
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

  var roomUrl = $location.$$url.split('/');
var roomName = roomUrl[roomUrl.length-1]

  var colors = ["#4cb7db", "#fff8b0", "#c4fcdd", "#ffb6c1", "#660066", "#f6546a", '#b32500', '#8dc63f', '#114355', '#794044', '#ca8f42', '#6a7d8e', '#00ffff', '#ff7373']
  $scope.backgroundPicked = function(pickBackground){
    if(pickBackground === "garden") $scope.boardStyle['background-color'] = "green";
    if(pickBackground === "space") $scope.boardStyle["background-color"] = "black";
  }

  var x, y, coord = {};
  $scope.mouseTrack = function($event){
    var movesObj = {ballID: "firstPerson"}
    movesObj.y = $event.offsetY / state.window.gameWindow;
    movesObj.x = $event.offsetX / state.window.gameWindow

    socket.emit('passCoord', movesObj);
    playerMoves(movesObj);
    eventDetection(movesObj);
  };

  function playerMoves(data) {
    data.x = Math.floor(window.innerWidth/2 * data.x);
    data.y = Math.floor(window.innerWidth/2 * data.y);
    Math.floor(window.innerWidth/2 * data.x);
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
    $( ".target" ).remove();
    var board = document.querySelector('.board');
    var targetDomX = Math.floor(state.window.gameWindow * data.targetCoord.x);
    var targetDomY = Math.floor(state.window.gameWindow * data.targetCoord.y);
    var target = document.createElement("div");
    target.setAttribute("class", "target");
    target.setAttribute("id", "target");
    target.style.top = targetDomY + "px";
    target.style.left = targetDomX + "px";
    document.querySelector('.board').appendChild(target);
    state.game.targetLocationCreate({"x": data.targetCoord.x, "y":data.targetCoord.y})

  })

  socket.emit('createRoom', roomName);

  function eventDetection(data) {
    // console.log("logged out of state",state.game);
    console.log("state.game.target : ", state.game.targetLocation.x);
    var holeCoordX = Math.floor(state.window.gameWindow * state.game.targetLocation.x);
    var holeCoordY = Math.floor(state.window.gameWindow * state.game.targetLocation.y);
    var ex = holeCoordX - data.x;
    var ey = holeCoordY - data.y;

    var targetDistance = Math.sqrt(ex * ex + ey * ey);
    if(targetDistance < 5 + 5){
      console.log("hit!!!!!!");
      socket.emit('userScored', 'dummy data')
      var fbID = localStorage.getItem('fbID');
      var pointsObj = {};
      pointsObj["facebookId"] = fbID;
      $http.post('/api/v1/add-point', pointsObj).
        success(function(data) {
          console.log("posted successfully: ", data);
        }).error(function(data) {
          console.error("error in posting: ", data);
        })
    }

  }

}]);
