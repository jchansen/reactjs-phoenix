var React = require('react');
var Route = require('react-router').Route;

/**
 * Routes are used to declare your view hierarchy
 * See: https://github.com/rackt/react-router/blob/master/docs/API.md
 */
var Master = require('./src/components/Master');
var Layout = require('./src/components/Layout');

module.exports = (
  <Route component={Master}>
    <Route path="/" component={Layout} />
  </Route>
);
