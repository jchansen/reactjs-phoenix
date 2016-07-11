var React = require('react');
var $ = require('jquery');
var Header = require('./Header');
var Repository = require('./Repository');
var PayloadStates = require('../constants/PayloadStates');
var payloadCollection = require('../utils').payloadCollection;

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

  getInitialState: function() {
    return {
      repositories: payloadCollection({items: []}, PayloadStates.FETCHING)
    };
  },

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
