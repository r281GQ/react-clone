import { createReactInstance } from "./../index";
import { createDOMElement } from "./../../DOM";

import { CLASS_COMPONENT, HOST_COMPONENT } from "./../../Constants";

/**
 *  createStateNode :: Fiber -> DOMNode | ReactInstance
 */
export default fiber => {
  if (fiber.tag === HOST_COMPONENT) {
    return createDOMElement(fiber);
  } else if (fiber.tag === CLASS_COMPONENT) {
    return createReactInstance(fiber);
  }
};
