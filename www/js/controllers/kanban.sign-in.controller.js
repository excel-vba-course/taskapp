var taskModule = angular.module('kanban.controllers');

var KanboardSignInController = function($ionicLoading, $scope,  $ionicActionSheet, $q,  $http, $window, $base64) {
	var createConfig = function() {
		var session = JSON.parse($window.localStorage["session"]);
    var auth = $base64.encode(session.username + ":" + session.password);
    var config = {
      headers: {
        'Authorization': 'Basic ' + auth
      }
    };
    return config;
	};

	$scope.logout = function() {
		$scope.me = null;
		$window.localStorage["me"] = null;
	}

	$scope.signIn = function(session) {
		$ionicLoading.show({
	    template: 'Loading...'
	  });
		$window.localStorage["session"] = JSON.stringify(session);
		var request = '{"jsonrpc": "2.0","method": "getMe", "id": 133280317}';
		$http.post(api_endpoint, request, createConfig()).success(function(request) {
			$window.localStorage["me"] = JSON.stringify(request.result);
			$scope.me = JSON.parse($window.localStorage["me"]);
			$ionicLoading.hide();
		});
	}
	if($window.localStorage["me"]) {
		$scope.me = JSON.parse($window.localStorage["me"]);
	}
}

taskModule.controller('KanboardSignInController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q',  '$http', '$window', '$base64', KanboardSignInController]);

