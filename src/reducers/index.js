var Redux = require('redux');
var combineReducers = Redux.combineReducers;

module.exports = combineReducers({
  repository: require('./repository')
});
