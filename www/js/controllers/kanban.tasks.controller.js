var taskModule = angular.module('kanban.controllers');

var KanboardTasksController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams, $state) {

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

	$scope.currentFilter = null;

	$scope.greaterThan = function(prop, val){
    return function(item) {
    	if(val == null) {
    		return true;
    	} else {
    		return parseInt(item[prop])*1000 > val;	
    	}  
    }
	}

	$scope.changeFilter = function(hour) {
		$scope.currentFilter = hour.difference;
	}

	$scope.clearFilter = function() {
		$scope.currentFilter = null;
	}

	$scope.redirect = function(task) {
		$state.go('app.tasks.task', {taskId: task.id});
	}

  $scope.hourFilters = [
  	{name: "1 Hours", difference: (Date.now() - 3600000)},
  	{name: "2 Hours", difference: (Date.now() - 3600000*2)},
  	{name: "4 Hours", difference: (Date.now() - 3600000*4)},
  	{name: "8 Hours", difference: (Date.now() - 3600000*8)},
  	{name: "1 Day", difference: (Date.now() - 3600000*24)},
  	{name: "1 Week", difference: (Date.now() - 3600000*24*7)},
  	{name: "1 Month", difference: (Date.now() - 3600000*24*30)}
  ]

	var request = '{"jsonrpc": "2.0","method": "getAllTasks", "id": 133280317, "params": {"project_id": '+$stateParams.projectId+', "status_id": 1}}';
	$http.post(api_endpoint + '?getAllTasks', request, createConfig()).success(function(request) {
		$ionicLoading.hide();
    $scope.tasks = request.result;
    angular.forEach($scope.tasks, function(task, i) {
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

var KanboardTaskController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams, $state) {

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

	$scope.changeAction = function(actionName) {
		$scope.action = actionName;
	}

	var loadTask = function() {
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
	      angular.forEach($scope.tasks, function(task, i) {
	      	if(parseInt(task.id) == parseInt($stateParams.taskId)) {
	      		$scope.tasks[i] = task;
	      		$scope.tasks[i].highlight = true;
	      	} else {
	      		$scope.tasks[i].highlight = false;
	      	}
	      })
	    });
		} else {
			$scope.task = {project_id: $stateParams.projectId}
		}
	}
	
	loadTask();
	$scope.action = "show"

	$scope.categories = JSON.parse($window.localStorage["categories"]);
	$scope.users = JSON.parse($window.localStorage["users"]);
	$scope.columns = JSON.parse($window.localStorage["columns"]);

	$scope.save = function(task) {
		$ionicLoading.show({
	    template: 'Loading...'
	  });
		if(!!task.id) {
			var request = JSON.stringify({"jsonrpc": "2.0","method": "updateTask", "id": 133280317, "params": {"project_id": task.project_id, "title": task.title, "description": task.description, "id": task.id, "score": task.score, "owner_id": task.owner_id, "category_id": task.category_id, "column_id": task.column_id}});
			$http.post(api_endpoint + '?updateTask', request, createConfig()).success(function(request) {
				$ionicLoading.hide();
				if(request.error) {
					alert(request.error.message)
				} else {
					$scope.changeAction('show');
					loadTask();
				}
	    });
		} else {
			var request = JSON.stringify({"jsonrpc": "2.0","method": "createTask", "id": 133280317, "params": {"project_id": task.project_id, "title": task.title, "description": task.description, "score": task.score, "owner_id": task.owner_id, "category_id": task.category_id, "column_id": task.column_id}});
			$http.post(api_endpoint + '?createTask', request, createConfig()).success(function(request) {
				$ionicLoading.hide();
	      if(request.error) {
					alert(request.error.message)
				} else {
					$state.go('app.tasks.task', {taskId: request.result});
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
      if(request.error) {
				alert(request.error.message)
			} else {
				$scope.task.comments.push({username: $scope.me.username, comment: $scope.newComment, date_creation: Date.now()/1000})
				$scope.newComment = "";
			}
    });
	}

	$scope.changeTime = function(comment, timeDisplay) {
		comment.timeDisplay = timeDisplay;
	}

}

taskModule.controller('KanboardTasksController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$state', KanboardTasksController]);
taskModule.controller('KanboardTaskController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$state', KanboardTaskController]);