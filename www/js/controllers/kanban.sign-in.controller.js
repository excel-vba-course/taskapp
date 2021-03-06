var taskModule = angular.module('kanban.controllers');

var KanboardSignInController = function($ionicLoading, $scope,  $ionicActionSheet, $q,  $http, $window, $base64, $ionicPopup) {
	var createConfig = function() {
		console.log($window.localStorage["session"]);
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
		$window.localStorage.clear();
	}

	$scope.signIn = function(session) {
		if(session){
			$ionicLoading.show({
				template: 'Loading...'
			});
			$window.localStorage["session"] = JSON.stringify(session);
			var request = '{"jsonrpc": "2.0","method": "getMe", "id": 133280317}';
			$http.post(api_endpoint, request, createConfig()).success(function(request) {
				$window.localStorage["me"] = JSON.stringify(request.result);
				$scope.me = JSON.parse($window.localStorage["me"]);
				$ionicLoading.hide();
			}).error(function(err){
				console.log(err);
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: 'Login Error',
					template: err.error
				});

			});
		}else{
			$ionicPopup.alert({
				title: 'Login Error',
				template: "Please provide login information"
			});
		}
	}
	if($window.localStorage["me"]) {
		$scope.me = JSON.parse($window.localStorage["me"]);
	}
}

taskModule.controller('KanboardSignInController', ['$ionicLoading', '$scope',
	'$ionicActionSheet', '$q',  '$http', '$window', '$base64', '$ionicPopup', KanboardSignInController]);

