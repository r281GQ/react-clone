export default reducers => (state, action) => {
  const nextState = {};

  Object.keys(reducers).forEach(reducerName => {
    const fn = reducers[reducerName];

    nextState[reducerName] = fn(state[reducerName], action);
  });

  return nextState;
};
