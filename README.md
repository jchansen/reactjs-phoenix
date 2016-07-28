# Purpose

This is the example app shown at the Phoenix ReactJS meetup and used to demonstrate architecture patterns for:

1. server communication
2. declarative components
3. data-driven components

## Intended Use

The branches in this repo represent a gradual refactor of the demo app. Going through the steps in order will likely be the easiest way to understand how the application progresses, and each step is a single conceptual change to the application.

### 1. start
This branch starts off the demo, and uses the `componentDidMount` method in the `List` component to fetch data from the GitHub API and set the state of the component. The `render` function then looks at the component's state to determine what to render.

```jsx
componentDidMount: function() {
  $.ajax({
    method: 'GET',
    url: 'https://api.github.com/search/repositories',
    data: {
      q: 'stars:>1000',
      sort: 'stars',
      per_page: 10
    }
  }).then(function(data, textStatus, xhr) {
    this.setState({
      repositories: data.items
    });
  }.bind(this)).fail(function(xhr, textStatus, error){
    this.setState({
      error: error
    });
  }.bind(this));
},

...

render: function() {
  var repositories = this.state.repositories;
  var error = this.state.error;
  var styles = this.getStyles();
  var body = null;

  if (error) {
    body = (
      <h2 style={styles.loading}>
        BOOM! Sad face.
      </h2>
    );
  }

  if (!repositories) {
    body = (
      <h2 style={styles.loading}>
        Loading...
      </h2>
    );
  } else {
    body = (
      <ul className="media-list" style={styles.repositories}>
        {repositories.map(this.renderRepository)}
      </ul>
    );
  }

  return (
    <div>
      <h2 style={styles.title}>
        Most Popular GitHub Repositories
      </h2>
      {body}
    </div>
  );

```

### 2. data-driven
This step refactors `start` by wrapping the data recieved from the server in a structure that allows it to be expressive and clear. We do this so that our components can become data-driven, meaning they know exactly what to do with the data based off nothing more that the `data.state` property. The components will know if they data is being fetched, updated, if there was an error updating, if the data couldn't be found, and could also be easily extended to provide custom states beyond the standard CRUD states (for example taking into account very specific API errors like rate limits, authorization, etc.)

```jsx
componentDidMount: function() {
  $.ajax({
    method: 'GET',
    url: 'https://api.github.com/search/repositories',
    data: {
      q: 'stars:>1000',
      sort: 'stars',
      per_page: 10
    }
  }).then(function(data, textStatus, xhr) {
    this.setState({
      repositories: payloadCollection(data, PayloadStates.RESOLVED)
    });
  }.bind(this)).fail(function(xhr, textStatus, error){
    this.setState({
      repositories: payloadCollection([], PayloadStates.ERROR_FETCHING, error)
    });
  }.bind(this));
},

...

render: function() {
  var repositories = this.state.repositories;
  var styles = this.getStyles();
  var body = null;

  if (repositories.state === PayloadStates.ERROR_FETCHING) {
    body = (
      <h2 style={styles.loading}>
        BOOM! Sad face.
      </h2>
    );
  }

  if (repositories.state === PayloadStates.FETCHING) {
    body = (
      <h2 style={styles.loading}>
        Loading...
      </h2>
    );
  }

  if (repositories.state === PayloadStates.RESOLVED) {
    body = (
      <ul className="media-list" style={styles.repositories}>
        {repositories.data.map(this.renderRepository)}
      </ul>
    );
  }

  return (
    <div>
      <h2 style={styles.title}>
        Most Popular GitHub Repositories
      </h2>
      {body}
    </div>
  );
}
```

### 3. server-communication-jquery
This steps refactors the application to use Redux. The jQuery code that fetches data from GitHub's API is moved into the Action, while the data that converts that result into state is moved into the Reducer.

```jsx
// List.js
contextTypes: {
  store: React.PropTypes.object.isRequired
},

getInitialState: function() {
  return {
    repositories: payloadCollection({items: []}, PayloadStates.FETCHING)
  };
},

componentDidMount: function() {
  var store = this.context.store;

  // save unsubscribe method to use on unmount
  this.unsubscribe = store.subscribe(this.handleChange);

  // bind action to the dispatch method and invoke it
  bindActionCreators(actions.repository.find, store.dispatch)();
},

componentWillUnmount: function() {
  this.unsubscribe();
},

handleChange: function() {
  var store = this.context.store;
  var storeState = store.getState();
  var repositories = storeState.repository.find;
  this.setState({
    repositories: repositories
  });
},
```

```js
// src/actions/repository/find.js
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
```

```js
// src/reducers/repository.js
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
```

### 4. server-communication-backbone
This step refactors the `repository.find` action to use Backbone instead of jQuery. We do this to create an abstraction tier that solves for specific REST API concerns (making it easier to interact with them), and provides us with a changce to manipulate the data before it's sent to the server or recieved from the server, and standarize all primary key fields under a single "id" paramter (regardless of whether they're called _id, id, username, etc. within the API itself).

```js
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
```

### 5. declaration-containers
This step breaks apart the component into a `List` component and a `ListContainer` component, and separates _what_ data the component needs with _how_ it gets that data. This improves testability, and also provides a step towards allowing components to declare what data they need.

```jsx
// src/components/List.js
module.exports = React.createClass({
  
  propTypes: {
    repositories: React.PropTypes.object.isRequired
  },
  ...
  
});
```

```jsx
// src/containers/List.js
var React = require('react');
var bindActionCreators = require('redux').bindActionCreators;
var actions = require('../actions');
var List = require('../components/List');

module.exports = React.createClass({
  displayName: 'ListContainer',

  contextTypes: {
    store: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    var store = this.context.store;
    return {
      repositories: store.getState().repository.find
    };
  },

  componentDidMount: function() {
    var store = this.context.store;

    // save unsubscribe method to use on unmount
    this.unsubscribe = store.subscribe(this.handleChange);

    // bind action to the dispatch method and invoke it
    bindActionCreators(actions.repository.find, store.dispatch)();
  },

  componentWillUnmount: function() {
    this.unsubscribe();
  },

  handleChange: function() {
    var store = this.context.store;
    this.setState({
      repositories: store.getState().repository.find
    });
  },

  render: function() {
    var repositories = this.state.repositories;

    return (
      <List repositories={repositories} />
    );
  }

});
```

### 6. declaration-connect
This step refactors the container to something more generic (called `connect`) that can be reused by any component and allows them to declare what data they want.

```jsx
module.exports = connect(function(getState, props) {
  return {
    repositories: getState({
      reducer: 'repository.find',
      action: 'repository.find'
    })
  };
})(
React.createClass({
  displayName: 'List',

  propTypes: {
    repositories: React.PropTypes.object.isRequired
  },
  
  ...
})
);
```

### 7. final version w/ pagination
The final version of this examples lives at https://github.com/lore/lore/tree/master/examples/pagination. It continues to build on these patterns, introducing conventions, and ultimately removing the need to define actions or reducers at all. It also extends the `connect` behavior to introduce support for querying and pagination.
