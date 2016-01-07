app.config(function($routeProvider, $locationProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
      })
      .when('/play', {
        templateUrl: 'partials/play.html',
        controller: 'PlayController'
      })
      .otherwise({redirectTo:'/'});
      $locationProvider.html5Mode(true);
  })
