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
      .otherwise({redirectTo:'/'});
      $locationProvider.html5Mode(true);
  })
