var Backbone = require('backbone');
var Repository = require('../models/Repository');

module.exports = Backbone.Collection.extend({
  model: Repository,

  url: 'https://api.github.com/search/repositories',

  parse: function(attributes) {
    return attributes.items;
  }

});
