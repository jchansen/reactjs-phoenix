var ActionTypes = require('../constants/ActionTypes');
var PayloadStates = require('../constants/PayloadStates');
var RepositoryCollection = require('../collections/Repository');
var payloadCollection = require('../utils').payloadCollection;

var initialState = {
  find: payloadCollection(new RepositoryCollection(), PayloadStates.INITIAL_STATE)
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
