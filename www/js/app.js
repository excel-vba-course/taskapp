// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
api_endpoint = "http://localhost:8100/kanban/jsonrpc.php";
// api_endpoint = "http://52.32.151.49/jsonrpc.php";


angular.module('kanban.controllers', [])
angular.module('kanban', ['ionic', 'kanban.controllers', 'base64'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: "ApplicationController"
  })


  .state('app.sign-in', {
    url: '/sign-in',
    views: {
      'menuContent': {
        templateUrl: 'templates/sign-in.html',
        controller: "KanboardSignInController"
      }
    }
  })

  .state('app.projects', {
    url: '/projects',
    views: {
      'menuContent': {
        templateUrl: 'templates/projects/index.html',
        controller: "KanboardProjectsInController"
      }
    }
  })
  .state('app.tasks', {
    url: '/projects/:projectId/tasks',
    views: {
      'menuContent': {
        templateUrl: 'templates/tasks/index.html',
        controller: "KanboardTasksController"
      }
    }
  })
  .state('app.tasks.task', {
    url: '/:taskId',
    templateUrl: 'templates/tasks/show.html',
    controller: "KanboardTaskController",
    parent: 'app.tasks'
  })
  .state('app.edit-task', {
    url: '/tasks/:taskId/edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/tasks/form.html',
        controller: "KanboardTaskController"
      }
    }
  })
  .state('app.new-task', {
    url: '/tasks/new?projectId',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/tasks/form.html',
        controller: "KanboardTaskController"
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/sign-in');
});
