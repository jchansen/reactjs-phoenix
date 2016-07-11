var PayloadStates = require('../../constants/PayloadStates');
var ActionTypes = require('../../constants/ActionTypes');
var RepositoryCollection = require('../../collections/Repository');
var payloadCollection = require('../../utils').payloadCollection;

module.exports = function fetchAll() {
  return function (dispatch) {
    var repositories = new RepositoryCollection();

    repositories.fetch({
      data: {
        q: 'stars:>1000',
        sort: 'stars',
        per_page: 10
      }
    }).then(function () {
      dispatch({
        type: ActionTypes.FETCH_REPOSITORIES,
        payload: payloadCollection(repositories, PayloadStates.RESOLVED)
      });
    }).fail(function(response) {
      var error = response.responseJSON;

      dispatch({
        type: ActionTypes.FETCH_REPOSITORIES,
        payload: payloadCollection(repositories, PayloadStates.ERROR_FETCHING, error)
      });
    });

    return dispatch({
      type: ActionTypes.FETCH_REPOSITORIES,
      payload: payloadCollection(repositories, PayloadStates.FETCHING)
    });
  };
};
