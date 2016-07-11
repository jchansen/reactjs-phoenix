var React = require('react');
var storeShape = require('react-redux/lib/utils/storeShape').default;
var _ = require('lodash');
var invariant = require('invariant');
var bindActionCreators = require('redux').bindActionCreators;
var PayloadStates = require('../constants/PayloadStates');
var actions = require('../actions');

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

function getState(reducerActionMap) {
  var store = this.context.store;
  var data = _.get(store.getState(), reducerActionMap.reducer);
  var action = _.get(actions, reducerActionMap.action);

  if (action && data.state === PayloadStates.INITIAL_STATE) {
    // bind action to the dispatch method and invoke it
    data = bindActionCreators(action, store.dispatch)().payload;
  }

  return data;
}

module.exports = function connect(select) {

  return function(DecoratedComponent) {

    var displayName = 'Connect(' + getDisplayName(DecoratedComponent) + ')';

    var ConnectDecorator = React.createClass({
      displayName: displayName,

      contextTypes: {
        store: storeShape.isRequired
      },

      /**
       * Build the initial props for the child component
       */
      getInitialState: function () {
        var initialState = this.selectState(this.props, this.context);
        this.nextState = initialState;
        return {};
      },

      /**
       * Every time this component is re-rendered, rebuild the child's props
       */
      shouldComponentUpdate: function (nextProps, nextState) {
        var nextState = this.selectState(nextProps, this.context);
        this.nextState = nextState;
        return true;
      },

      componentDidMount: function () {
        this.unsubscribe = this.context.store.subscribe(this.handleChange);
      },

      /**
       * Whenever the store state changes, rebuild the props for the child component
       */
      handleChange: function() {
        var nextState = this.selectState(this.props, this.context);
        this.setState(nextState);
      },

      /**
       * Unsubscribe from the store when this component is unmounted
       */
      componentWillUnmount: function () {
        this.unsubscribe();
      },

      /**
       * Discover what the data the component needs, and what action to invoke
       */
      selectState: function (props, context) {
        return select(getState.bind(this), props, context);
      },

      render: function () {
        return React.createElement(
          DecoratedComponent,
          _.assign({ ref: 'decoratedComponent' }, this.nextState, this.props)
        );
      }
    });

    return ConnectDecorator;
  }
};
