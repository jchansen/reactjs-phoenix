function payload(model, state) {
  return {
    id: model.id,
    state: state,
    data: model.toJSON()
  };
}

function payloadCollection(collection, state, error) {
  return {
    state: state,
    data: collection.models.map(function(model) {
      return payload(model, state);
    }),
    error: error || {}
  };
}

module.exports = {
  payload,
  payloadCollection
};
