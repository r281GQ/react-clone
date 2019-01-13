/**
 *  compose :: ((y -> z), ..., (a -> b)) -> a -> z
 */
const compose = (...fn) => value =>
  fn.reduceRight((value, fn) => fn(value), value);

export default middlewares => {
  return createStore => (reducer, initialState) => {
    const store = createStore(reducer, initialState);

    let withRealDispatch = () => null;

    const middlewareAPI = {
      getState: store.getState,
      dispatch: action => withRealDispatch(action)
    };

    /**
     *  Inject the middlewareApi to the functions.
     */
    const chain = middlewares.map(fn => fn(middlewareAPI));

    /**
     *  Set up the fn ref chain.
     */
    const fn = compose(...chain);

    /**
     *  Feed the real dispatch to the last middleware.
     */
    withRealDispatch = fn(store.dispatch);

    return {
      ...store,
      dispatch: action => withRealDispatch(action)
    };
  };
};
