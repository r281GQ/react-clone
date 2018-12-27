import { arrify, createQueue, requestIdleCallback } from "./../Misc";
import {
  ENOUGHT_TIME,
  HOST_COMPONENT,
  HOST_ROOT,
  PLACEMENT
} from "./../Constants";

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
    stateNode: task.dom,
    tag: HOST_ROOT,
    effects: []
  };
};

/**
 *  createStateNode :: ReactElement -> DOMNode | ReactInstance
 */
const createStateNode = element =>
  element.type === "TEXT_ELEMENT"
    ? document.createTextNode(element.props.nodeValue)
    : document.createElement(element.type);

/**
 *  reconcileChildren :: (Fiber, Children | [Children]) -> Void
 */
const reconcileChildren = (fiber, children) => {
  const arrifiedChildren = arrify(children);

  if (arrifiedChildren.length === 0) {
    return;
  }

  const newFiber = {
    props: arrifiedChildren[0].props,
    type: arrifiedChildren[0].type,
    tag: HOST_COMPONENT,
    stateNode: createStateNode(arrifiedChildren[0]),
    parent: fiber,
    effects: [],
    effectTag: PLACEMENT
  };

  fiber.child = newFiber;
};

/**
 *  commitAllWork :: Fiber -> Void
 */
const commitAllWork = fiber => {
  fiber.effects.forEach(item => {
    item.parent.stateNode.appendChild(item.stateNode);
  });
};

/**
 *  beginTask :: Fiber -> Void
 */
const beginTask = fiber => {
  reconcileChildren(fiber, fiber.props.children);
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

  // console.log(pendingCommit);

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
