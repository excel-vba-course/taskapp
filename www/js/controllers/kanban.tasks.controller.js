var taskModule = angular.module('kanban.controllers');

var KanboardTasksController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams, $state, $interpolate) {

  $scope.tasks = [];
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

	$scope.mainContainerHeight = "700";
	$scope.projectId = $stateParams.projectId;

	$ionicLoading.show({
    template: 'Loading...'
  });

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
		$scope.currentFilter = hour;
		$window.localStorage["currentFilter"] = JSON.stringify(hour);
	}

	$scope.clearFilter = function() {
		$scope.currentFilter = null;
		$window.localStorage["currentFilter"] = null;
	}

	$scope.redirect = function(task) {
		$state.go('app.tasks.task', {taskId: task.id});
	}


	$scope.todayInSeconds = Date.now()/1000;
  $scope.hourFilters = [
    {name: "All", difference: 0},
  	{name: "1 Hours", difference: (Date.now() - 3600000)/1000},
  	{name: "2 Hours", difference: (Date.now() - 3600000*2)/1000},
  	{name: "4 Hours", difference: (Date.now() - 3600000*4)/1000},
  	{name: "8 Hours", difference: (Date.now() - 3600000*8)/1000},
  	{name: "1 Day", difference: (Date.now() - 3600000*24)/1000},
  	{name: "1 Week", difference: (Date.now() - 3600000*24*7)/1000},
  	{name: "1 Month", difference: (Date.now() - 3600000*24*30)/1000}
  ];
  
  $scope.currentFilter = JSON.parse($window.localStorage["currentFilter"] || null);
  if(!$scope.currentFilter)  // if not stored in local storage select All as default
    $scope.currentFilter = $scope.hourFilters[0];


  $scope.fetchTaskAssets = function(task) {
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
  	angular.forEach(JSON.parse($window.localStorage["columns"]), function(column, i) {
  		if(column.id == task.column_id) {
  			task.column_name = column.title
  		}
  	})
  	angular.forEach(JSON.parse($window.localStorage["swimlanes"] || null), function(swimlane, i) {
  		if(swimlane.id == task.swimlane_id) {
  			task.swimlane_name = swimlane.name
  		}
  	});
  }

	var request = '{"jsonrpc": "2.0","method": "getAllTasks", "id": 133280317, "params": {"project_id": '+$stateParams.projectId+', "status_id": 1}}';
	$http.post(api_endpoint + '?getAllTasks', request, createConfig()).success(function(request) {
		$ionicLoading.hide();
    $scope.tasks = request.result;
    angular.forEach($scope.tasks, function(task, i) {
    	$scope.fetchTaskAssets(task);
    })
  });

}

var KanboardTaskController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, $stateParams, $state, $filter) {

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

	$scope.mainContainerHeight = "350";
	$scope.changeAction = function(actionName) {
		$scope.action = actionName;
	}

	var loadTask = function() {
		if(!!$stateParams.taskId) {
			$ionicLoading.show({
			  template: 'Loading...'
			});
			var taskFetched = false;
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
	      		$scope.tasks.splice(i, 1, $scope.task);
	      		$scope.fetchTaskAssets($scope.task)
	      		$scope.tasks[i].highlight = true;
	      		taskFetched = true
	      	} else {
	      		$scope.tasks[i].highlight = false;
	      	}
	      })
	      if(!taskFetched) {
	      	$scope.tasks.push($scope.task)
	      	$scope.fetchTaskAssets($scope.task)
	      }
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
	$scope.swimlanes = JSON.parse($window.localStorage["swimlanes"]);

	$scope.save = function(task) {
		$ionicLoading.show({
	    template: 'Loading...'
	  });
		if(!!task.id) {
			var request = JSON.stringify({"jsonrpc": "2.0","method": "updateTask", "id": 133280317, "params": {"project_id": task.project_id, "title": task.title, "description": task.description, "id": task.id, "score": task.score, "owner_id": task.owner_id, "category_id": task.category_id, "column_id": task.column_id, "swimlane_id": task.swimlane_id}});
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
			var request = JSON.stringify({"jsonrpc": "2.0","method": "createTask", "id": 133280317, "params": {"project_id": task.project_id, "title": task.title, "description": task.description, "score": task.score, "owner_id": task.owner_id, "category_id": task.category_id, "column_id": task.column_id, "swimlane_id": task.swimlane_id}});
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

	$scope.addComment = function(newComment) {
		$ionicLoading.show({
	    template: 'Loading...'
	  });
		var request = JSON.stringify({"jsonrpc": "2.0", "method": "createComment", "id": 133280317, "params": {"task_id": $stateParams.taskId, "user_id": $scope.me.id, "content": newComment}});
		$http.post(api_endpoint, request, createConfig()).success(function(request) {
			$ionicLoading.hide();
      if(request.error) {
				alert(request.error.message)
			} else {
				$scope.task.comments.push({username: $scope.me.username, comment: newComment, date_creation: Date.now()/1000})
				$scope.newComment = "";
			}
    });
	}

	$scope.changeTime = function(comment, timeDisplay) {
		comment.timeDisplay = timeDisplay;
	};

  $scope.$watch(function(scope) { return scope.currentFilter.name }, function(newValue, oldValue) {
		var currentTaskList = $filter('inBetween')($scope.tasks, $scope.currentFilter.difference, $scope.todayInSeconds,'date_creation');
		if(newValue != oldValue) {
    	if(currentTaskList.indexOf($scope.task) == -1) {
	    	if(currentTaskList.length != 0)
	    		$state.go('app.tasks.task', {taskId: currentTaskList[0].id});
	    	else
	    		$state.go('app.tasks');
	    }
    }
  });

}

taskModule.controller('KanboardTasksController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$state', '$interpolate', KanboardTasksController]);
taskModule.controller('KanboardTaskController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$state', '$filter', KanboardTaskController]);