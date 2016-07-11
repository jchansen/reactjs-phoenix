var React = require('react');

module.exports = React.createClass({
  displayName: 'Repository',

  getStyles: function(isLoading) {
    return {
      image: {
        width: '64px',
        height: '64px'
      }
    }
  },

  render: function() {
    var repository = this.props.repository;
    var description = repository.data.description;
    var styles = this.getStyles();
    var tokens = [];

    if (description.length > 135) {
      description = description.substring(0,135);
      tokens = description.split(' ');
      tokens.pop();
      description = tokens.join(' ') + '...';
    }

    return (
      <li key={repository.id} className="media">
        <div className="media-left">
          <a href={repository.data.html_url}>
            <img className="media-object" src={repository.data.owner.avatar_url} style={styles.image}/>
          </a>
        </div>
        <div className="media-body">
          <h4 className="media-heading">
            <span className="badge pull-right">{repository.data.stargazers_count}</span>
            {repository.data.name}
          </h4>
          {description}
        </div>
      </li>
    );
  }

});
