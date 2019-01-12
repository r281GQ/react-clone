export default (reducer, initialState) => {
  let currentState;

  let subscribers = [];

  let calculateState = action => {
    if (action.type === "INIT") {
      currentState = initialState;
    }

    currentState = reducer(currentState, action);

    subscribers.forEach(subs => subs(currentState));
  };

  calculateState({ type: "INIT" });

  return {
    subscribe: fn => {
      subscribers.push(fn);
    },
    dispatch: action => {
      calculateState(action);
    },
    getState: () => {
      return currentState;
    }
  };
};
