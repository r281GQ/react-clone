/**
 *  createReactInstance :: Fiber -> ReactInstance
 */
export default fiber => {
  const instance = new fiber.type(fiber.props);

  return instance;
};
