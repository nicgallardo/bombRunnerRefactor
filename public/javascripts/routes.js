app.config(function($routeProvider, $locationProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
      })
      .when('/multiplayer/:id', {
        templateUrl: 'partials/play.html',
        controller: 'PlayController'
      })
      .when('/lobby/:id', {
        templateUrl: 'partials/lobby.html',
        controller: 'LobbyController'
      })
      .when('/post-game/:id', {
        templateUrl: 'partials/post-game.html',
        controller: 'PostGameController',
        resolve: {
          points: ['$http', function($http) {
            return $http.get('api/v1/all-points/'+ this.location.pathname.split('/')[2]).then(function(res){
              return res.data;
            });
          }],
          users: ['$http', function($http) {
            return $http.get('api/v1/users-played/'+ this.location.pathname.split('/')[2]).then(function(res){
              return res.data;
            });
          }]
        }
      })
      .when('/leaders', {
        templateUrl: 'partials/leaders.html',
        controller: 'LeadersController'
      })
      .otherwise({redirectTo:'/'});
      $locationProvider.html5Mode(true);
  })
