var React = require('react');
var Provider = require('react-redux').Provider;
var Router = require('react-router').Router;

module.exports = React.createClass({
  displayName: 'Root',

  propTypes: {
    history: React.PropTypes.object.isRequired,
    routes: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired
  },

  render: function render() {
    var history = this.props.history;
    var routes = this.props.routes;
    var store = this.props.store;

    return (
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>
    );
  }
});
