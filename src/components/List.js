var React = require('react');
var Header = require('./Header');
var Repository = require('./Repository');
var PayloadStates = require('../constants/PayloadStates');
var payloadCollection = require('../utils').payloadCollection;
var bindActionCreators = require('redux').bindActionCreators;
var actions = require('../actions');

module.exports = React.createClass({
  displayName: 'List',

  getStyles: function() {
    return {
      title: {
        textAlign: 'center'
      },
      loading: {
        textAlign: 'center',
        marginTop: '64px',
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'rgba(0,0,0,.54)'
      },
      repositories: {
        marginTop: '32px'
      }
    }
  },

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

  renderRepository: function(repository) {
    return (
      <Repository key={repository.id} repository={repository} />
    );
  },

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

});
