/**
 *  traverseToRoot :: ReactInstance -> Fiber
 */
export default instance => {
  let fiber = instance.__fiber;

  while (fiber.parent) {
    fiber = fiber.parent;
  }

  return fiber;
};
