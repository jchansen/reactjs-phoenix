function payload(model, state) {
  return {
    id: model.id,
    state: state,
    data: model
  };
}

function payloadCollection(collection, state, error) {
  return {
    state: state,
    data: collection.items.map(function(model) {
      return payload(model, state);
    }),
    error: error || {}
  };
}

module.exports = {
  payload,
  payloadCollection
};
