var taskModule = angular.module('kanban.controllers');

var KanboardTasksController = function($ionicLoading, $scope, $ionicActionSheet, 
	$q, $http, $window, $base64, $stateParams, $state, $interpolate, $filter, $rootScope) {

	$scope.tasks = [];
  var selectedTaskId;
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

$scope.changeHourFilter = function(hour) {
  $scope.currentFilter.hour = hour;
  $window.localStorage["currentFilter"] = JSON.stringify($scope.currentFilter);
  decideOnTask();
}

$scope.changeUserFilter = function(user) {
  $scope.currentFilter.user = user;
  $window.localStorage["currentFilter"] = JSON.stringify($scope.currentFilter);
  decideOnTask();
}

$scope.clearFilter = function() {
  $scope.currentFilter = null;
  $window.localStorage["currentFilter"] = null;
}

$scope.redirect = function(task) {
  selectedTaskId = parseInt(task.id);
  $state.go('app.tasks.task', {taskId: task.id});
}

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

$scope.userFilters = [
{name: "All", id: null, field: null},
{name: "Mine", id: $scope.me.id, field: "owner_id"},
{name: "Other", id: $scope.me.id, field: "creator_id"},
];

$scope.currentFilter = JSON.parse($window.localStorage["currentFilter"] || null);
  if(!$scope.currentFilter)  // if not stored in local storage select All as default
  	$scope.currentFilter = {
  		hour: $scope.hourFilters[0],
  		user: $scope.userFilters[0]
  	};


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

  	$scope.doRefresh = function() {
      $ionicLoading.show();
  		getTasks();
  	}


  	var getTasks = function() {
  		var request = '{"jsonrpc": "2.0","method": "getAllTasks", "id": 133280317, "params": {"project_id": '+$stateParams.projectId+', "status_id": 1}}';
  		$http.post(api_endpoint + '?getAllTasks', request, createConfig()).success(function(request) {
  			$ionicLoading.hide();
        $scope.todayInSeconds = Date.now()/1000;
  			$scope.tasks = request.result;
  			angular.forEach($scope.tasks, function(task, i) {
  				$scope.fetchTaskAssets(task);
  			})
  			$scope.$broadcast('scroll.refreshComplete');
  			decideOnTask();
  		});
  	} 

  	getTasks();

    $rootScope.$on("taskCreated", function(event, taskId){
      selectedTaskId = parseInt(taskId);
      getTasks();
      $state.go('app.tasks.task', {taskId: taskId});
    });


    var decideOnTask = function(){
      var currentTaskList = $filter('inBetween')($scope.tasks, $scope.currentFilter.hour.difference, $scope.todayInSeconds,'date_creation');
      currentTaskList = $filter('belongsTo')(currentTaskList, $scope.currentFilter.user.id, $scope.currentFilter.user.field);
      var taskIds = _.map(currentTaskList, function(task){
       return parseInt(task.id);
      });
      if(taskIds.indexOf(selectedTaskId) == -1) {
       if(currentTaskList.length != 0){
        selectedTaskId = parseInt(currentTaskList[0].id);
        $state.go('app.tasks.task', {taskId: selectedTaskId});
       }
       else{
        selectedTaskId = undefined;
        $state.go('app.tasks');
       }
     }
    };

}

var KanboardTaskController = function($ionicLoading, $scope, $ionicActionSheet, $q, $http, $window, $base64, 
  $stateParams, $state, $ionicScrollDelegate, $filter, $rootScope) {

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
  if(actionName == "show") {
   loadTask();
 }
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
     $ionicScrollDelegate.scrollBottom();
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
    $rootScope.$broadcast('taskCreated', request.result);//broadcast to refresh tasklist
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
    $ionicScrollDelegate.scrollBottom();
  }
});
}

$scope.changeTime = function(comment, timeDisplay) {
  comment.timeDisplay = timeDisplay;
};

}

taskModule.controller('KanboardTasksController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$state', '$interpolate', '$filter', '$rootScope', KanboardTasksController]);
taskModule.controller('KanboardTaskController', ['$ionicLoading', '$scope',  '$ionicActionSheet', '$q', '$http', '$window', '$base64', '$stateParams', '$state', '$ionicScrollDelegate', '$filter', '$rootScope', KanboardTaskController]);


