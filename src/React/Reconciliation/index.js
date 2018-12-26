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

  return task;
};

/**
 *  executeSubTask :: Fiber -> Fiber
 */
const executeSubTask = fiber => {};

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
export const render = (element, DOMNode) => {
  taskQueue.push(null);

  requestIdleCallback(performTask);
};
