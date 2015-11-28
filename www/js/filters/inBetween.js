var taskModule = angular.module('kanban.controllers');
taskModule.filter("inBetween", function() {
  return function(items, from, to, property) {
        var arrayToReturn = [];        
        for (var i=0; i<items.length; i++){
            var fieldValue = parseInt(items[i][property]);
        if (fieldValue > from && fieldValue < to)  {
                arrayToReturn.push(items[i]);
            }
        }
        return arrayToReturn;
  };
});