var React = require('react');
var Repository = require('./Repository');
var PayloadStates = require('../constants/PayloadStates');
var connect = require('../containers/Connect');

@connect(function(getState, props) {
  return {
    repositories: getState({
      reducer: 'repository.find',
      action: 'repository.find'
    })
  };
})
class List extends React.Component {

  static propTypes = {
    repositories: React.PropTypes.object.isRequired
  };

  getStyles() {
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
  }

  renderRepository(repository) {
    return (
      <Repository key={repository.id} repository={repository} />
    );
  }

  render() {
    var repositories = this.props.repositories;
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

}
