var $ = require('jquery');
var PayloadStates = require('../../constants/PayloadStates');
var ActionTypes = require('../../constants/ActionTypes');
var payloadCollection = require('../../utils').payloadCollection;

module.exports = function fetchAll() {
  return function (dispatch) {
    $.ajax({
      method: 'GET',
      url: 'https://api.github.com/search/repositories',
      data: {
        q: 'stars:>1000',
        sort: 'stars',
        per_page: 10
      }
    }).then(function(data, textStatus, xhr) {
      dispatch({
        type: ActionTypes.FETCH_REPOSITORIES,
        payload: payloadCollection(data, PayloadStates.RESOLVED)
      });
    }).fail(function(xhr, textStatus, error){
      dispatch({
        type: ActionTypes.FETCH_REPOSITORIES,
        payload: payloadCollection({items: []}, PayloadStates.ERROR_FETCHING, error)
      });
    });

    return dispatch({
      type: ActionTypes.FETCH_REPOSITORIES,
      payload: payloadCollection({items: []}, PayloadStates.FETCHING)
    });
  };
};
