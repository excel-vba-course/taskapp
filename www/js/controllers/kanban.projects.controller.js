var taskModule = angular.module('kanban.controllers');

var KanboardProjectsInController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64) {
	var session = JSON.parse($window.localStorage["session"]);
	$scope.e = $base64.encode(session.username + ":" + session.password);

	var createConfig = function() {
    var auth = $base64.encode(session.username + ":" + session.password);
    var config = {
      headers: {
        'Authorization': 'Basic ' + auth
      }
    };
    return config;
	};

  $ionicLoading.show({
    template: 'Loading...'
  });

	var request = '{"jsonrpc": "2.0","method": "getMyProjects", "id": 133280317}';
	$http.post(api_endpoint + '?getMyProjects', request, createConfig()).success(function(request) {
    $ionicLoading.hide();
    $scope.projects = request.result;
  });
}

taskModule.controller('KanboardProjectsInController', ['$ionicLoading', '$scope', '$ionicActionSheet', '$q', '$http', '$window', '$base64', KanboardProjectsInController]);

