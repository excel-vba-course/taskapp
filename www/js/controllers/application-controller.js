var taskModule = angular.module('kanban.controllers');

var ApplicationController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams, $ionicNavBarDelegate) {

	var createConfig = function() {
		// var session = JSON.parse($window.localStorage["session"]);
    var auth = $base64.encode("jsonrpc:6c50ee6b032d0d4583f4c51ace0376a116526d1be033d8c7ec475fb35d3d");
    var config = {
      headers: {
        'X-API-Auth': auth
      }
    };
    return config;
	};

	if($window.localStorage["me"]) {
		$scope.me = JSON.parse($window.localStorage["me"])
	}

	$scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
	
	$scope.sync = function() {
		$http.post(api_endpoint, '{"jsonrpc": "2.0","method": "getAllUsers", "id": 133280317}', createConfig()).success(function(request) {
			$window.localStorage["users"] = JSON.stringify(request.result);
	  });
	  $http.post(api_endpoint, '{"jsonrpc": "2.0","method": "getAllCategories", "id": 133280017, "params": {"project_id": 1}}', createConfig()).success(function(request) {
			$window.localStorage["categories"] = JSON.stringify(request.result);
	  });
	  $http.post(api_endpoint, '{"jsonrpc": "2.0","method": "getColumns", "id": 133280017, "params": [1]}', createConfig()).success(function(request) {
			$window.localStorage["columns"] = JSON.stringify(request.result);
	  });
	  $http.post(api_endpoint, '{"jsonrpc": "2.0","method": "getAllSwimlanes", "id": 133280017, "params": [1]}', createConfig()).success(function(request) {
			$window.localStorage["swimlanes"] = JSON.stringify(request.result);
	  });
	}

	if($window.localStorage["users"] == null) {
		$scope.sync();
	}
	
}

taskModule.controller('ApplicationController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$ionicNavBarDelegate', ApplicationController]);
