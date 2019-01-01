let wipFiber = null;

export const setWorkInProgressFiber = fiber => {
  wipFiber = fiber;
};

export const getWorkInProgressFiber = () => {
  return wipFiber;
};

export const clearWorkInProgressFiber = () => {
  wipFiber = null;
};
