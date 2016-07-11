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
