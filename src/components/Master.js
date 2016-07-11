var React = require('react');

module.exports = React.createClass({
  displayName: 'Master',

  render: function() {
    return (
      <div>
        {React.cloneElement(this.props.children)}
      </div>
    );
  }
});
