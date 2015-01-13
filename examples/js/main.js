
var epics = [{id : 0, description : 'Unification Of Media'}, { id : 1, description : 'Trading Desk'}, { id : 2, description : 'Tech Costs'}, { id : 3, description : 'Tactical'}, { id : 4, description : 'Barter'}, { id : 5, description :'Lego'}, {id : 6, description : 'Media Plan'}, {id : 7, description : 'Infrastructure'}];
var autocomplete = React.createElement(ReactAutocomplete, {options : epics, label : 'description'});

React.render(autocomplete, document.getElementById('example1'));

var autocomplete2 = React.createElement(ReactAutocomplete, {options : epics, label : function(result){
  return result.description.toUpperCase();
}});

React.render(autocomplete2, document.getElementById('example2'));
