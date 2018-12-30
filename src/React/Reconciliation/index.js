import {
  ENOUGHT_TIME,
  HOST_COMPONENT,
  HOST_ROOT,
  PLACEMENT,
  UPDATE,
  DELETION,
  CLASS_COMPONENT
} from "./../Constants";
import { updateDOMElement, createDOMElement } from "./../DOM";
import {
  arrify,
  createReactInstance,
  createQueue,
  requestIdleCallback
} from "./../Misc";

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
 *  createStateNode :: ReactElement -> DOMNode | ReactInstance
 */
const createStateNode = (element, tag) => {
  if (tag === HOST_COMPONENT) {
    return createDOMElement(element);
  } else if (tag === CLASS_COMPONENT) {
    return createReactInstance(element);
  }
};

const getTag = element => {
  return typeof element.type === "string" ? HOST_COMPONENT : CLASS_COMPONENT;
};

/**
 *  reconcileChildren :: (Fiber, Children | [Children]) -> Void
 *
 *  Fibers are created here.
 */
const reconcileChildren = (fiber, children) => {
  const arrifiedChildren = arrify(children);

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

  while (index < numberOfElements || alternate) {
    element = arrifiedChildren[index];

    /**
     *  If there is an alternate while there is no child
     *  that means the DOMNode got deleted.
     */
    if (!element && alternate) {
      alternate.effectTag = DELETION;
      fiber.effects.push(alternate);

      /**
       *  If the Fiber was present previuosly but there is
       *  a type mismatch we need to create a new
       *  DOMNode and delete the old one.
       */
    } else if (element && alternate && element.type !== alternate.type) {
      newFiber = {
        alternate,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: createStateNode(element, getTag(element)),
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT
      };

      alternate.effectTag = DELETION;

      fiber.effects.push(alternate);

      /**
       *  If the Fiber was present previuosly and it is now
       *  just simply update its props.
       */
    } else if (element && alternate) {
      newFiber = {
        alternate,
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: alternate.stateNode,
        parent: fiber,
        effects: [],
        effectTag: UPDATE
      };

      /**
       *  Initial render.
       */
    } else if (element && !alternate) {
      newFiber = {
        props: element.props,
        type: element.type,
        tag: getTag(element),
        stateNode: createStateNode(element, getTag(element)),
        parent: fiber,
        effects: [],
        effectTag: PLACEMENT
      };
    }

    /**
     *  In the first iteration it is a direct parent - child
     *  relationship.
     */
    if (index === 0) {
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

    /**
     *  As we go sideways with the current tree
     *  we do the same with the alternate tree.
     */
    if (alternate && alternate.sibling) {
      alternate = alternate.sibling;
    } else {
      alternate = null;
    }

    previousFiber = newFiber;

    index++;
  }
};

/**
 *  commitWork :: Fiber -> Void
 *
 *  Takes on Fiber with an Effect at time and performs DOM mutation.
 */
const commitWork = item => {
  if (item.effectTag === UPDATE) {
    updateDOMElement(item.stateNode, item.alternate.props, item.props);

    /**
     *  If it was an update but there was type mismatch
     *  stateNode had to be created. Since it is a different instance
     *  then the previous one it needs to be reattached to he appropriate
     *  DOMNode.
     */
    if (item.parent.stateNode !== item.alternate.parent.stateNode) {
      item.parent.stateNode.appendChild(item.stateNode);
    }
  } else if (item.effectTag === DELETION) {
    item.parent.stateNode.removeChild(item.stateNode);
  } else if (item.effectTag === PLACEMENT) {
    let fiber = item;
    let parentFiber = item.parent;

    while (parentFiber.tag === CLASS_COMPONENT) {
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
};

/**
 *  beginTask :: Fiber -> Void
 */
const beginTask = fiber => {
  if (fiber.tag === CLASS_COMPONENT) {
    reconcileChildren(fiber, fiber.stateNode.render());
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

  if (subTask || taskQueue.length > 0) {
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
