import {
  ENOUGHT_TIME,
  HOST_COMPONENT,
  HOST_ROOT,
  PLACEMENT,
  UPDATE,
  DELETION,
  CLASS_COMPONENT,
  FUNCTIONAL_COMPONENT,
  PASSIVE_EFFECT
} from "./../Constants";
import { updateDOMElement } from "./../DOM";
import {
  arrify,
  createStateNode,
  createQueue,
  getTag,
  requestIdleCallback,
  setWorkInProgressFiber,
  traverseToRoot
} from "./../Misc";

import { updateFunctionalComponent } from "./../Hooks";

/**
 *  Queue data structure holding the tasks that needs to be processed.
 */
const taskQueue = createQueue();

/**
 *  The currently executing fiber.
 */
let subTask = null;

/**
 *  If it is not null that means we finished a render cycle and sideEffects
 *  are ready to be painted to the DOM.
 */
let pendingCommit = null;

/**
 *  getFirstSubTask :: a -> Fiber | Null
 *
 *  Pops the taskQueue and grabs the first Task to work on and returns
 *  the initial Fiber to process or Null if there are no more Fibers left.
 */
const getFirstSubTask = () => {
  const task = taskQueue.pop();

  if (task.from === CLASS_COMPONENT) {
    const root = traverseToRoot(task.instance);

    /**
     *  We can grab the alternate tree later and can have access
     *  to the partialState.
     */
    task.instance.__fiber.partialState = task.partialState;

    return {
      props: root.props,
      alternate: root,
      stateNode: root.stateNode,
      child: null,
      sibling: null,
      tag: HOST_ROOT,
      effects: []
    };
  }

  if (task.from === FUNCTIONAL_COMPONENT) {
    const root = traverseToRoot({ __fiber: task.fiber });

    return {
      props: root.props,
      alternate: root,
      stateNode: root.stateNode,
      child: null,
      sibling: null,
      tag: HOST_ROOT,
      effects: []
    };
  }

  return {
    props: task.newProps,
    alternate: task.dom.__rootFiberContainer,
    stateNode: task.dom,
    child: null,
    sibling: null,
    tag: HOST_ROOT,
    effects: []
  };
};

/**
 *  addIndex :: (ReactElement, Number) -> ReactElement | Null
 */
const addIndex = (element, index) =>
  element != null ? { ...element, index } : null;

/**
 *  filterNull :: (ReactElement | Null) -> ReactElement
 */
const filterNull = element => element != null;

/**
 *  reconcileChildren :: (Fiber, Children | [Children]) -> Void
 *
 *  Fibers are created here.
 */
const reconcileChildren = (fiber, children) => {
  const arrifiedChildren = arrify(children)
    .map(addIndex)
    .filter(filterNull);

  /**
   *  Current index of the iteration.
   */
  let index = 0;

  /**
   *  Number of children to process.
   */
  let numberOfElements = arrifiedChildren.length;

  /**
   *  Current ReactElement of the iteration.
   */
  let element;

  /**
   *  The corresponding Fiber represenation of the JSX coming from the child
   *  from the previous cycle.
   */
  let alternate;

  /**
   *  If we need to go sideways (there are multiple children in the array)
   *  we hold the reference of the Fiber created in the previous iteration.
   */
  let previousFiber;

  /**
   *  The Fiber made out of the current ReactElement.
   */
  let newFiber;

  /**
   *  Assign the initital alternate Fiber if there are any.
   */
  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }

  /**
   *  Hold Key - Fiber pairs in a Hashtable for quick lookup.
   */
  const elementMap = new Map();

  /**
   *  Populate the map.
   */
  while (alternate) {
    elementMap.set(alternate.index, alternate);

    alternate = alternate.sibling;
  }

  /**
   *  Uniq id for the given ReactElement/Fiber.
   */
  let currentIndex;

  /**
   *  Alternate Fiber for the the ReactElement currently being processed.
   */
  let currentAlternate;

  /**
   *  ReactElement currently being processed has an alternate Fiber.
   */
  let hasAlternate;

  while (index < numberOfElements) {
    element = arrifiedChildren[index];

    if (arrifiedChildren.every(i => i.isArray && !i.props.key)) {
      throw new Error("every eleement in an array must have a unqie key");
    }

    // console.log(fiber);

    let isDynamicChildren = arrifiedChildren.every(i => i.isArray);
    // let isDynamicChildren = false;

    currentIndex = isDynamicChildren ? element.props.key : element.index;

    hasAlternate = elementMap.has(currentIndex);

    currentAlternate = elementMap.get(currentIndex);

    /**
     *  If they are in the same slot, but types differ.
     */
    if (
      hasAlternate &&
      (element.type !== currentAlternate.type ||
        (element.type === currentAlternate.type &&
          element.props.key &&
          element.props.key !== currentAlternate.key))
    ) {
      newFiber = {
        index: currentIndex,
        alternate: null,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        parent: fiber,
        effects: [],
        effectTag: "w",
        updateQueue: [],
        d: currentAlternate
      };

      if (element.props.key) {
        newFiber.key = element.props.key;
      }

      newFiber.stateNode = createStateNode(newFiber);

      if (getTag(element) === FUNCTIONAL_COMPONENT) {
        newFiber.memoizedState = {
          memoizedState: undefined,
          next: undefined,
          queue: undefined
        };
      }

      currentAlternate.effectTag = "ww";

      fiber.effects.push(currentAlternate);
      /**
       *  They are in the same slot, just update props.
       */
    } else if (hasAlternate && element.type === currentAlternate.type) {
      newFiber = {
        index: currentAlternate.index,
        alternate: currentAlternate,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: currentAlternate.stateNode,
        partialState: currentAlternate.partialState,
        parent: fiber,
        effects: [],
        effectTag: UPDATE,
        updateQueue: [],
        memoizedState: currentAlternate.memoizedState,
        snapshotEffect: currentAlternate.stateNode.getSnapshotBeforeUpdate
          ? true
          : undefined
      };

      if (currentAlternate.key) {
        newFiber.key = currentAlternate.key;
      }

      /**
       *  Create new Fiber with a 'PLACEMENT' tag.
       */
    } else if (!hasAlternate) {
      newFiber = {
        index: element.index,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT,
        updateQueue: []
      };

      if (element.props.key) {
        newFiber.key = element.props.key;
      }

      if (getTag(element) === FUNCTIONAL_COMPONENT) {
        newFiber.memoizedState = {
          memoizedState: undefined,
          next: undefined,
          queue: undefined
        };
      }

      newFiber.stateNode = createStateNode(newFiber);
    }

    /**
     *  After process get rid of the alternate from the map.
     */
    elementMap.delete(currentIndex);

    /**
     *  In the first iteration it is a direct parent - child
     *  relationship.
     */
    if (!previousFiber) {
      fiber.child = newFiber;
      /**
       *  in the upcoming iteration we don't attach the new Fiber to the parent
       *  as it would overwrite the prev reference.
       *
       *  Instead we create a sibling relation using the Fiber generated in the prev iteration.
       */
    } else if (element) {
      previousFiber.sibling = newFiber;
    }

    previousFiber = newFiber;

    index++;
  }

  /**
   *  The map at this point because of the deletions has the Fiber
   *  that has no corresponding wip representation.
   *
   *  That means they need to be deleted.
   */
  for (let forDeletetion of elementMap.values()) {
    forDeletetion.effectTag = DELETION;
    fiber.effects.push(forDeletetion);
  }
};

/**
 *  commitWork :: Fiber -> Void
 *
 *  Takes on Fiber with an Effect at time and performs DOM mutation.
 */
const commitWork = item => {
  console.log(item);
  /**
   *  In reconcileChildren the new Fiber structure gets created every time.
   *  We need to update the reference accordingly.
   */
  if (item.tag === CLASS_COMPONENT || item.tag === FUNCTIONAL_COMPONENT) {
    item.stateNode.__fiber = item;
  }

  if (item.effectTag === "w") {
    let fiber = item;
    let parentFiber = item.parent;

    let alternate = item.d;
    let pal = parentFiber.alternate;

    while (
      parentFiber.tag === CLASS_COMPONENT ||
      parentFiber.tag === FUNCTIONAL_COMPONENT
    ) {
      parentFiber = parentFiber.parent;
    }

    while (pal.tag === CLASS_COMPONENT || pal.tag === FUNCTIONAL_COMPONENT) {
      pal = pal.parent;
    }
    while (
      fiber.tag === CLASS_COMPONENT ||
      fiber.tag === FUNCTIONAL_COMPONENT
    ) {
      fiber = fiber.child;
    }

    while (
      alternate.tag === CLASS_COMPONENT ||
      alternate.tag === FUNCTIONAL_COMPONENT
    ) {
      alternate = alternate.child;
    }

    parentFiber.stateNode.replaceChild(fiber.stateNode, alternate.stateNode);
  } else if (item.effectTag === UPDATE) {
    console.log("sd3333");
    if (item.tag === HOST_COMPONENT || item.tag === HOST_ROOT)
      updateDOMElement(item.stateNode, item.alternate.props, item.props);

    /**
     *  If it was an update but there was type mismatch
     *  stateNode had to be created. Since it is a different instance
     *  then the previous one it needs to be reattached to he appropriate
     *  DOMNode.
     */
    if (item.parent.stateNode !== item.alternate.parent.stateNode) {
      console.log("999");
      let parentFiber = item.parent;

      while (
        parentFiber.tag === CLASS_COMPONENT ||
        parentFiber.tag === FUNCTIONAL_COMPONENT
      ) {
        parentFiber = parentFiber.parent;
      }

      parentFiber.stateNode.replaceChild(item.stateNode, item.stateNode);
    }
  } else if (item.effectTag === DELETION) {
    let fiber = item;
    let parentFiber = item.parent;

    while (
      fiber.tag === CLASS_COMPONENT ||
      fiber.tag === FUNCTIONAL_COMPONENT
    ) {
      fiber = fiber.child;
    }

    if (parentFiber.tag === HOST_COMPONENT)
      parentFiber.stateNode.removeChild(fiber.stateNode);
  } else if (item.effectTag === PLACEMENT) {
    let fiber = item;
    let parentFiber = item.parent;

    while (
      parentFiber.tag === CLASS_COMPONENT ||
      parentFiber.tag === FUNCTIONAL_COMPONENT
    ) {
      parentFiber = parentFiber.parent;
    }

    if (fiber.tag === HOST_COMPONENT)
      parentFiber.stateNode.appendChild(fiber.stateNode);
  }
};

/**
 *  commitAllWork :: Fiber -> Void
 */
const commitAllWork = fiber => {
  const withSnapshot = fiber.effects.filter(effect => effect.snapshotEffect);

  withSnapshot.forEach(effect => {
    effect.snapshotEffect = effect.stateNode.getSnapshotBeforeUpdate(
      effect.memoizedProps,
      effect.memoizedState
    );
  });

  /**
   *  Commit all the painting related work.
   */
  fiber.effects.forEach(commitWork);

  /**
   *  Have a reference to the previously built Fiber tree
   *  so we can compare it with the new one
   *  that will be being built in the new cycle.
   *
   *  This is saved to the root node which will never be gone.
   */
  fiber.stateNode.__rootFiberContainer = fiber;

  /**
   *  Indicates the the effects been flushed out.
   */
  pendingCommit = null;

  /**
   *  Gathers effects that has an updateQueue.
   */
  const effectHooks = fiber.effects.filter(effect => {
    return effect.updateQueue.length !== 0;
  });

  effectHooks.forEach(effect =>
    effect.updateQueue.forEach(hook => {
      /**
       *  If it is a normal effect call the destroy method first
       *  if any, than call the effect and assign the clean up function.
       *
       *  Prevent calling the effect function if it is an unmount.
       */
      if (hook.effect === PASSIVE_EFFECT) {
        let destroy = hook.destroy;

        if (typeof destroy === "function") {
          destroy();
        }

        if (effect.effectTag !== DELETION) {
          hook.destroy = hook.create();
        }
        /**
         *  On no_effect only call the effect function if it is a deletion.
         */
      } else {
        if (effect.effectTag === DELETION) {
          hook.destroy();
        }
      }
    })
  );

  const assignRefs = fiber.effects.filter(
    effect =>
      effect.props.ref &&
      effect.tag !== FUNCTIONAL_COMPONENT &&
      (effect.effectTag === PLACEMENT || effect.effectTag === UPDATE)
  );

  const removeRefs = fiber.effects.filter(
    effect =>
      effect.props.ref &&
      effect.tag !== FUNCTIONAL_COMPONENT &&
      effect.effectTag === DELETION
  );

  assignRefs.forEach(effect => {
    if (typeof effect.props.ref === "function") {
      effect.props.ref(effect.stateNode);
    } else {
      effect.props.ref.current = effect.stateNode;
    }
  });

  removeRefs.forEach(effect => {
    if (typeof effect.props.ref === "function") {
      effect.props.ref(null);
    } else {
      effect.props.ref.current = null;
    }
  });

  const mountEffects = fiber.effects.filter(effect => {
    return effect.effectTag === PLACEMENT && effect.tag === CLASS_COMPONENT;
  });

  mountEffects.forEach(effect => {
    effect.stateNode.componentDidMount();
  });

  const unMountEffects = fiber.effects.filter(effect => {
    return effect.effectTag === DELETION && effect.tag === CLASS_COMPONENT;
  });

  unMountEffects.forEach(effect => {
    effect.stateNode.componentWillUnmount();
  });

  const updateEffects = fiber.effects.filter(effect => {
    return effect.effectTag === UPDATE && effect.tag === CLASS_COMPONENT;
  });

  updateEffects.forEach(effect => {
    effect.stateNode.componentDidUpdate(
      effect.memoizedProps,
      effect.memoizedState,
      effect.snapshotEffect
    );
  });
};

/**
 *  copyChildren :: Fiber -> Void
 *
 *  Copies the Fiber structure from the alternate tree without any modification
 *  so later the alternate tree is there even when no render was done.
 */
const copyChildren = fiber => {
  /**
   *  The corresponding Fiber represenation of the JSX coming from the child
   *  from the previous cycle.
   */
  let alternate;

  /**
   *  If we need to go sideways (there are multiple children in the array)
   *  we hold the reference of the Fiber created in the previous iteration.
   */
  let previousFiber;

  /**
   *  The Fiber made out of the current ReactElement.
   */
  let newFiber;

  /**
   *  Assign the initital alternate Fiber if there are any.
   */
  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }

  while (alternate) {
    newFiber = { ...alternate, alternate, parent: fiber, effects: [] };

    /**
     *  In the first iteration it is a direct parent - child
     *  relationship.
     */
    if (!previousFiber) {
      fiber.child = newFiber;
      /**
       *  in the upcoming iteration we don't attach the new Fiber to the parent
       *  as it would overwrite the prev reference.
       *
       *  Instead we create a sibling relation using the Fiber generated in the prev iteration.
       */
    } else {
      previousFiber.sibling = newFiber;
    }

    previousFiber = newFiber;

    /**
     *  As we go sideways with the current tree
     *  we do the same with the alternate tree.
     */
    alternate = alternate.sibling;
  }
};

/**
 *  calculateState :: Fiber -> State
 */
const calculateState = fiber => {
  let nextState = fiber.partialState
    ? {
        ...fiber.stateNode.state,
        ...fiber.partialState
      }
    : fiber.stateNode.state;

  fiber.partialState = null;

  const derivedState = fiber.type.getDerivedStateFromProps(
    fiber.props,
    nextState
  );

  return { ...nextState, ...derivedState };
};

/**
 *  beginTask :: Fiber -> Void
 */
const beginTask = fiber => {
  setWorkInProgressFiber(fiber);

  if (fiber.tag === CLASS_COMPONENT) {
    const nextState = calculateState(fiber);

    const shouldRender =
      fiber.effectTag === PLACEMENT
        ? true
        : fiber.stateNode.shouldComponentUpdate(fiber.props, nextState);

    if (fiber.effectTag === UPDATE) {
      fiber.memoizedState = fiber.stateNode.state;
      fiber.memoizedProps = fiber.stateNode.props;
    }

    fiber.stateNode.props = fiber.props;

    fiber.stateNode.state = nextState;

    if (shouldRender) {
      reconcileChildren(fiber, fiber.stateNode.render());
    } else {
      copyChildren(fiber);
    }
  } else if (fiber.tag === FUNCTIONAL_COMPONENT) {
    reconcileChildren(
      fiber,
      updateFunctionalComponent(() => fiber.stateNode(fiber.props))
    );
  } else if (fiber.tag === HOST_COMPONENT || fiber.tag === HOST_ROOT) {
    reconcileChildren(fiber, fiber.props.children);
  }
};

/**
 *  executeSubTask :: Fiber -> Fiber | Null
 */
const executeSubTask = fiber => {
  beginTask(fiber);

  /**
   *  If `beginTask(fiber)` modifies the Fiber in such a way that it will have
   *  a child than start processing it in the next iteration.
   */
  if (fiber.child) {
    return fiber.child;
  }

  let currentlyExecutedFiber = fiber;

  /**
   *  Grabs the Fiber own Effects with its Effects in the effects array and propogates them
   *  to its parent. That is repeated until there are no parents left. That means we reached
   *  the root component. That case assign pendingcommit to the roor and signal it is ready to be painted.
   */
  while (currentlyExecutedFiber.parent) {
    currentlyExecutedFiber.parent.effects = currentlyExecutedFiber.parent.effects.concat(
      currentlyExecutedFiber.effects.concat([currentlyExecutedFiber])
    );

    /**
     *  First we go as deep as we can, gather all the effect as we coming up
     *  traversing the Fiber tree, than we go sideways.
     */
    if (currentlyExecutedFiber.sibling) {
      return currentlyExecutedFiber.sibling;
    }

    currentlyExecutedFiber = currentlyExecutedFiber.parent;
  }

  pendingCommit = currentlyExecutedFiber;
};

/**
 *  performTask :: DeadLine -> Void
 *
 *  Grabs the first subTask (Fiber) from the queue if there is no
 *  Fiber being executed at the moment.
 *
 *  Keeps an imperative iteration running if the browser is not busy
 *  and there is work to do (subTask !== null).
 *
 *  If there are any pending commits, starts the painting process
 *  outside of the time-sliced iteration.
 */
const workLoop = deadLine => {
  if (!subTask) {
    subTask = getFirstSubTask();
  }

  while (subTask && deadLine.timeRemaining() > ENOUGHT_TIME) {
    subTask = executeSubTask(subTask);
  }

  if (pendingCommit) commitAllWork(pendingCommit);
};

/**
 *  performTask :: DeadLine -> Void
 *
 *  Initiates the WorkLoop and keeps it running until there
 *  are at least one subTask or the taskQueue is not empty.
 */
const performTask = deadLine => {
  workLoop(deadLine);

  if (subTask || !taskQueue.isEmpty) {
    requestIdleCallback(performTask);
  }
};

/**
 *  render :: (Element, DOMNode) -> Void
 *
 *  Pushes a new Task to the queue and invokes the WorkLoop.
 */
export const render = (element, dom) => {
  taskQueue.push({
    dom,
    newProps: { children: element }
  });

  requestIdleCallback(performTask);
};

export const scheduleUpdate = (instance, partialState) => {
  taskQueue.push({
    from: CLASS_COMPONENT,
    instance,
    partialState
  });

  requestIdleCallback(performTask);
};

export const scheduleFunctionalUpdate = fiber => {
  taskQueue.push({
    from: FUNCTIONAL_COMPONENT,
    fiber
  });

  requestIdleCallback(performTask);
};
