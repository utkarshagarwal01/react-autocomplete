
var epics = [{id : 0, description : 'Unification Of Media'}, { id : 1, description : 'Trading Desk'}, { id : 2, description : 'Tech Costs'}, { id : 3, description : 'Tactical'}, { id : 4, description : 'Barter'}, { id : 5, description :'Lego'}, {id : 6, description : 'Media Plan'}, {id : 7, description : 'Infrastructure'}];
var autocomplete = React.createElement(ReactAutocomplete, {options : epics, label : 'description'});

ReactDOM.render(autocomplete, document.getElementById('example1'));

var autocomplete2 = React.createElement(ReactAutocomplete, {options : epics, label : function(result){
  return result.description.toUpperCase();
}});

ReactDOM.render(autocomplete2, document.getElementById('example2'));

var epics2 = [{Id : 0, title : 'Unification Of Media'}, { Id : 1, title : 'Trading Desk'}, { Id : 2, title : 'Tech Costs'}]
var autocomplete3 = React.createElement(ReactAutocomplete, {options : epics2, resultIdentifier : 'Id'});

ReactDOM.render(autocomplete3, document.getElementById('example3'));
