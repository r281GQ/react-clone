import {
  CLASS_COMPONENT,
  FUNCTIONAL_COMPONENT,
  HOST_COMPONENT
} from "./../../Constants";
import { Component } from "./../../Component";

/**
 *  getTag :: ReactElement -> String
 */
export default element => {
  if (typeof element.type === "string") {
    return HOST_COMPONENT;
    /**
     *  If it is a class based component we expect the prototype to be Component
     */
  } else if (Object.getPrototypeOf(element.type) !== Component) {
    return FUNCTIONAL_COMPONENT;
  } else {
    return CLASS_COMPONENT;
  }
};
