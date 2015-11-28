var taskModule = angular.module('kanban.controllers');
taskModule.filter("belongsTo", function() {
  return function(items, id) {
  	if(id == null)
  		return items;
    var arrayToReturn = [];        
    for (var i=0; i<items.length; i++){
        var creatorId = items[i]['creator_id'];
        var ownerId = items[i]['owner_id'];
        
    if (creatorId == id || ownerId == id)  {
            arrayToReturn.push(items[i]);
        }
    }
    return arrayToReturn;
  };
});