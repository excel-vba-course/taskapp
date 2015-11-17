var taskModule = angular.module('kanban.controllers');

var KanboardSignInController = function($ionicLoading, $scope,  $ionicActionSheet, $q,  $http, $window) {
	$scope.signIn = function(session) {
		$window.localStorage["session"] = JSON.stringify(session);
		alert("done")
	}
}

taskModule.controller('KanboardSignInController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q',  '$http', '$window', KanboardSignInController]);

