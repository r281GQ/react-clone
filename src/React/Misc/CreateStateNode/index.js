import { createReactInstance } from "./../index";
import { createDOMElement } from "./../../DOM";
import { HOST_COMPONENT } from "./../../Constants";

/**
 *  createStateNode :: Fiber -> DOMNode | ReactInstance
 */
export default fiber => {
  if (fiber.tag === HOST_COMPONENT) {
    return createDOMElement(fiber);
  } else {
    return createReactInstance(fiber);
  }
};
