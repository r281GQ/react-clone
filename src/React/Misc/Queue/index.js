/**
 *  createQueue :: a -> Queue
 */
export default () => {
  const taskQueue = [];

  return {
    pop: () => taskQueue.shift(),
    push: item => taskQueue.push(item),
    isEmpty: () => taskQueue.length === 0
  };
};
