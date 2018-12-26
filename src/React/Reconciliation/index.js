const requestIdleCallback = window.requestIdleCallback;

const createQueue = () => {
  const taskQueue = [];

  return {
    pop: () => taskQueue.shift(),
    push: item => taskQueue.push(item),
    isEmpty: () => taskQueue.length === 0
  };
};

const ENOUGHT_TIME = 1;

const taskQueue = createQueue();

let subTask = null;

/**
 *  getFirstSubTask :: a -> Fiber | Null
 *
 *  Pops the taskQueue and grabs the first Task to work on and return the initial Fiber to process.
 */
const getFirstSubTask = () => {
  let task = taskQueue.pop();

  return {
    props: task.newProps,
    stateNode: task.dom,
    tag: "host_root"
  };
};

// ReactElement -> Fiber -> [Fiber] (sideEffect)
const reconcileChildren = (fiber, children) => {
  let newFiber = {
    props: children.props,
    type: children.type,
    tag: "host_component",
    stateNode: document.createElement(children.type),
    parent: fiber
  };
};

const beginTask = fiber => {
  // find out what kind of fiber it is (host ? class ? function ?)

  const children = fiber.props.children;

  reconcileChildren(fiber, children);
};

/**
 *  executeSubTask :: Fiber -> Fiber
 */
const executeSubTask = fiber => {
  // determine siblings and childs
  // begin on working on the fiber
  beginTask(fiber);
  // make an inventory of what needs to be painted
};

const workLoop = deadLine => {
  if (!subTask) {
    subTask = getFirstSubTask();
  }

  while (subTask && deadLine.timeRemaining() > ENOUGHT_TIME) {
    subTask = executeSubTask(subTask);
  }
};

const performTask = deadLine => {
  workLoop(deadLine);

  if (subTask || taskQueue.length > 0) {
    requestIdleCallback(performTask);
  }
};

/**
 *  render :: (Element, DOMNode) -> Void
 */
export const render = (element, dom) => {
  taskQueue.push({
    dom,
    newProps: { children: element }
  });

  requestIdleCallback(performTask);
};
