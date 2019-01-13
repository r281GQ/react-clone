const createStore = (reducer, initialState, middleWare) => {
  let currentState;

  let subscribers = [];

  if (middleWare) {
    return middleWare(createStore)(reducer, initialState);
  }

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

export default createStore;
