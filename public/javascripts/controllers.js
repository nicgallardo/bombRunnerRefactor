app.controller('HomeController', ['$scope', function($scope) {
  $scope.update = function(gameRoomName) {
    $scope.roomName = gameRoomName;
  };
}]);

app.controller('NavController', ['$scope', '$window', '$http', function($scope, $window, $http) {
    var findBrowser = $window.navigator.userAgent;
    //when window < 700 have mobile
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
app.controller('LobbyController', ['$scope', '$window', '$http', '$location', function($scope, $window, $http, $location) {

  var socket = io();
  var lobbyUrl = $location.$$url.split('/');
  $scope.lobbyName = lobbyUrl[lobbyUrl.length-1]

  $http.get('/me').then(function(data){
    socket.emit('createLobby', data.data, $scope.lobbyName)
  })

  socket.on('usersInLobby', function (data) {
    console.log(dummydata);
    $scope.$apply(function(){
      console.log("usersInLobbyData : ", data);
    })
  });
  //allow user to pick ball color
  //create play-button which shifts all players to game room when all players are ready


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
      },

      bombsLocationArray: [],

      bombsCoordCreate: function(data){
        // console.log("bombsCoordCreate", data);
        state.game.bombsLocationArray = data;
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
      // ball.style.background = rgba(39,62,84,0.82);
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

  socket.on('removeSocketPlayer', function(ballId){
    var socketUserDiv = document.getElementById(ballId);
    $(socketUserDiv).remove();
  })
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
    blinkDiv(target)
    function blinkDiv(elem) {
      $(elem).fadeOut('fast', function(){
        $(this).fadeIn('fast', function(){
          blinkDiv(this);
        });
      });
    }

  })
  socket.on('bombsToDom', function(data){
    state.game.bombsCoordCreate(data.bombs);
    var board = document.querySelector('.board');
    var bombDomX, bombDomY;
    for (var i = 0; i < data.bombs.length; i++) {
      bombDomX = Math.floor(state.window.gameWindow * data.bombs[i][0]);
      bombDomY = Math.floor(state.window.gameWindow * data.bombs[i][1]);
      var bomb = document.createElement("div");
      bomb.setAttribute("class", "bomb");
      bomb.setAttribute("id", "bomb");
      bomb.style.top = bombDomY + "px";
      bomb.style.left = bombDomX + "px";
      document.querySelector('.board').appendChild(bomb);
    }
  })
  socket.on('domTickerScore', function(playerData){
    var ticker = document.querySelector('.ticker');
    var name = playerData.data.firstname;
    var pic =  playerData.data.profilepic;
    $( ".ticker" ).append( "<div class='score-div'><h4>" + name + " Target Hit!</h4></div>");
    var elem = document.querySelector('.score-div');
    blinkDiv(elem)
    function blinkDiv(elem) {
      $(elem).fadeOut('fast', function(){
        $(this).fadeIn('fast', function(){
          blinkDiv(this);
        });
      });
    }
    setTimeout(function(){
      $( ".score-div" ).remove();
    }, 4000);
  })

  socket.on('domTickerExplode', function(playerData){
    // console.log("DOM PLAYER DATA : ",playerData);
    var ticker = document.querySelector('.ticker');
    var name = playerData.data.firstname;
    var pic =  playerData.data.profilepic;
    $( ".ticker" ).append( "<div class='score-div'><h4>" + name + " blew up!</h4></div>");
    var elem = document.querySelector('.score-div');
    blinkDiv(elem)
    function blinkDiv(elem) {
      $(elem).fadeOut('fast', function(){
        $(this).fadeIn('fast', function(){
          blinkDiv(this);
        });
      });
    }
    setTimeout(function(){
      $( ".score-div" ).remove();
    }, 4000);
  })

  socket.emit('createRoom', roomName);

  function eventDetection(data) {
    var fbID = localStorage.getItem('fbID');
    var bombsArray = state.game.bombsLocationArray;
    var targetCoordX = Math.floor(state.window.gameWindow * state.game.targetLocation.x);
    var targetCoordY = Math.floor(state.window.gameWindow * state.game.targetLocation.y);
    var ex = targetCoordX- data.x;
    var ey = targetCoordY - data.y;

    var targetDistance = Math.sqrt(ex * ex + ey * ey);
    if(targetDistance < 5 + 5){
      socket.emit('userScored', '--dummy data--');
      socket.emit('createBomb', { x: targetCoordX, y: targetCoordY});
      var pointsObj = {};
      pointsObj["facebookId"] = fbID;
      $http.post('/api/v1/add-point', pointsObj).
      success(function(data) {
        // console.log("posted successfully: ", data);
      }).error(function(data) {
        // console.error("error in posting: ", data);
      })
      $http({ method: 'GET', url: '/me'})
      .then(function successCallback(data) {
        socket.emit('updateTickerScore', data)
      },
      function errorCallback(response) {
        console.error("err : ",response);
      });
    }

    for (var i = 0; i < bombsArray.length; i++) {
      var dx = Math.floor(state.window.gameWindow * bombsArray[i][0]) - data.x;
      var dy = Math.floor(state.window.gameWindow * bombsArray[i][1]) - data.y;
      var bombDistance = Math.sqrt(dx * dx + dy * dy);
      if (bombDistance < 9.5 + 9.5) {

        document.getElementById('popDiv').style.display = 'block';
        document.getElementById('gameOverMsg').innerHTML = "<h3>Game Over!</h3>";

        var explosionObj = {};
        explosionObj["facebookId"] = fbID;
        // console.log("HIT!!!!!");
        $http.post('/api/v1/add-explosion', pointsObj).
        success(function(data) {
          // console.log("posted successfully: ", data);
        }).error(function(data) {
          // console.error("error in posting: ", data);
        })
        $http({ method: 'GET', url: '/me'})
        .then(function successCallback(data) {
          socket.emit('playerExplode', data)
        },
        function errorCallback(response) {
          console.error("err : ",response);
        });
        //remove player from all DOMS
        // document.getElementById('popDiv').style.display = 'block';
        // document.getElementById('gameOverMsg').innerHTML = "<h3>Game Over!</h3>";
      }
    }

  }
}]);
