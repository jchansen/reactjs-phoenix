var React = require('react');
var ReactDOM = require('react-dom');
var Redux = require('redux');
var applyMiddleware = Redux.applyMiddleware;
var createStore = Redux.createStore;
var thunk = require('redux-thunk').default;
var browserHistory = require('react-router').browserHistory;
var routes = require('./routes');
var Root = require('./Root');

// Create Redux store
var reducer = require('./src/reducers/index');
var middleware = applyMiddleware(thunk);
var store = createStore(
  reducer,
  middleware
);

// Render app to DOM
ReactDOM.render(
  <Root
    history={browserHistory}
    routes={routes}
    store={store}
  />,
  document.getElementById('root')
);
