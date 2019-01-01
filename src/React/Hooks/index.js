import {
  getWorkInProgressFiber,
  clearWorkInProgressFiber
} from "./../Misc/WorkInProgressFiber";

import { scheduleFunctionalUpdate } from "./../Reconciliation";

/**
 *  This is the wip Fiber at the time the hooks are called.
 */
let currentFiber;

/**
 *  This is the "state machine" implementation of the current hook being called.
 *
 *  The order of calling the hooks in the client matters because it has a fixed
 *  order in the Fiber implementation of it.
 */
let currentHook;

/**
 *  getNextHook :: a -> Void
 *
 *  Sets the currentHook or creates one if its the initial render
 *  to the appropriate one given the order how they were described in the client.
 */
const getNextHook = () => {
  if (!currentHook) {
    currentHook = currentFiber.memoizedState;
  } else {
    if (!currentHook.next) {
      currentHook.next = {
        memoizedState: undefined,
        next: undefined,
        queue: undefined
      };
    }

    currentHook = currentHook.next;
  }
};

/**
 *  prepareHooks :: a -> Void
 *
 *  Sets the wip Fiber.
 */
const prepareHooks = () => {
  currentFiber = getWorkInProgressFiber();
};

/**
 *  cleanHooks :: a -> Void
 *
 *  Clears both the Fiber and hook global vars.
 */
const cleanHooks = () => {
  currentFiber = null;

  currentHook = null;

  clearWorkInProgressFiber();
};

/**
 *  rawSetter :: (Hook, Fiber) -> a -> Void
 *
 *  Creates a function that can be called outside of the context.
 *
 *  Pushed a new value onto the queue and triggers a rerender.
 */
const rawSetter = (currentHook, currentFiber) => value => {
  currentHook.queue.push(value);

  scheduleFunctionalUpdate(currentFiber);
};

/**
 *  useState :: a -> [a, a -> Void]
 */
export const useState = initialState => {
  getNextHook();

  if (!currentHook.queue) {
    currentHook.memoizedState = initialState;
    currentHook.queue = [initialState];
  } else {
    currentHook.memoizedState = currentHook.queue[currentHook.queue.length - 1];
  }

  let value = currentHook.memoizedState;

  let setter = rawSetter(currentHook, currentFiber);

  return [value, setter];
};

/**
 *  useEffect :: (a -> a -> Void, [a]) -> Void
 */
export const useEffect = (create, input) => {
  getNextHook();

  let prevEffect;

  if (!currentHook.queue) {
    currentHook.memoizedState = {
      create,
      destroy: null,
      input,
      effect: "passive_effect"
    };
    currentHook.queue = [currentHook.memoizedState];
  } else {
    prevEffect = currentHook.memoizedState;

    currentHook.memoizedState = {
      create,
      destroy: prevEffect.destroy,
      input,
      effect: "passive_effect"
    };

    currentHook.queue.push(currentHook.memoizedState);
  }

  currentFiber.updateQueue.push(currentHook.memoizedState);
};

/**
 *  updateFunctionalComponent :: (a -> ReactElement) -> ReactElement
 */
export const updateFunctionalComponent = fn => {
  prepareHooks();

  const elements = fn();

  cleanHooks();

  return elements;
};
