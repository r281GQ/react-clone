/**
 *  createReactInstance :: Fiber -> ReactInstance
 */
export default fiber => {
  const instance = new fiber.type(fiber.props);

  instance.__fiber = fiber;

  return instance;
};
