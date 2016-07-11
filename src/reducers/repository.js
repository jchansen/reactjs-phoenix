var ActionTypes = require('../constants/ActionTypes');

var initialState = {
  find: {}
};

module.exports = function find(state, action) {
  var nextState = state || initialState;

  switch (action.type) {
    case ActionTypes.FETCH_REPOSITORIES:
      return {
        find: action.payload
      };

    default:
      return nextState
  }
};
