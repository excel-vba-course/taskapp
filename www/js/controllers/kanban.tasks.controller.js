var taskModule = angular.module('kanban.controllers');

var KanboardTasksController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams) {

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

	$scope.projectId = $stateParams.projectId;

	$ionicLoading.show({
    template: 'Loading...'
  });

	var request = '{"jsonrpc": "2.0","method": "getAllTasks", "id": 133280317, "params": {"project_id": '+$stateParams.projectId+', "status_id": 1}}';
	$http.post(api_endpoint + '?getAllTasks', request, createConfig()).success(function(request) {
		$ionicLoading.hide();
    $scope.tasks = request.result;
    angular.forEach($scope.tasks, function(task, i) {
    	console.log($window.localStorage["categories"]);
    	angular.forEach(JSON.parse($window.localStorage["categories"]), function(category, i) {
    		if(category.id == task.category_id) {
    			task.category_name = category.name
    		}
    	})
    	angular.forEach(JSON.parse($window.localStorage["users"]), function(user, i) {
    		if(user.id == task.owner_id) {
    			if(user.name == null) {
    				task.owner_name = user.username
    			} else {
    				task.owner_name = user.name
    			}
    		}
    	})
    })
  });

}

var KanboardTaskController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams) {

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

	if(!!$stateParams.taskId) {
		$ionicLoading.show({
		  template: 'Loading...'
		});
		var request = JSON.stringify({"jsonrpc": "2.0","method": "getTask", "id": 133280317, "params": {"task_id": $stateParams.taskId}});
		$http.post(api_endpoint, request, createConfig()).success(function(request) {
      $scope.task = request.result;
      var request = JSON.stringify({"jsonrpc": "2.0","method": "getAllComments", "id": 133280317, "params": {"task_id": $stateParams.taskId}});
      $http.post(api_endpoint, request, createConfig()).success(function(request) {
      	$scope.task.comments = request.result;
      	$ionicLoading.hide();
      });
    });
	} else {
		$scope.task = {project_id: $stateParams.projectId}
	}

	$scope.save = function(task) {
		$ionicLoading.show({
	    template: 'Loading...'
	  });
		if(!!task.id) {
			var request = JSON.stringify({"jsonrpc": "2.0","method": "updateTask", "id": 133280317, "params": {"project_id": task.project_id, "title": task.title, "description": task.description, "id": task.id}});
			$http.post(api_endpoint + '?updateTask', request, createConfig()).success(function(request) {
				$ionicLoading.hide();
				if(request.error) {
					alert(request.error.message)
				} else {
					alert("Task Updated")
				}
	    });
		} else {
			var request = JSON.stringify({"jsonrpc": "2.0","method": "createTask", "id": 133280317, "params": {"project_id": task.project_id, "title": task.title, "description": task.description}});
			$http.post(api_endpoint + '?createTask', request, createConfig()).success(function(request) {
				$ionicLoading.hide();
	      if(request.error) {
					alert(request.error.message)
				} else {
					alert("Task Created")
				}
	    });	
		}
	}

	$scope.addComment = function() {
		$ionicLoading.show({
	    template: 'Loading...'
	  });
		var request = JSON.stringify({"jsonrpc": "2.0","method": "createComment", "id": 133280317, "params": {"task_id": $stateParams.taskId, "user_id": $scope.me.id, "content": $scope.newComment}});
		$http.post(api_endpoint, request, createConfig()).success(function(request) {
			$ionicLoading.hide();
			console.log(request)
      if(request.error) {
				alert(request.error.message)
			} else {
				$scope.task.comments.push({username: $scope.me.username, comment: $scope.newComment})
			}
    });
	}

}

taskModule.controller('KanboardTasksController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', KanboardTasksController]);
taskModule.controller('KanboardTaskController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', KanboardTaskController]);