var taskModule = angular.module('kanban.controllers');
taskModule.filter("belongsTo", function() {
  return function(items, id, field) {
  	if(id == null)
  		return items;
    var arrayToReturn = [];        
    for (var i=0; i<items.length; i++){
        var extractedField = items[i][field];
        
    if (extractedField == id)  {
            arrayToReturn.push(items[i]);
        }
    }
    return arrayToReturn;
  };
});