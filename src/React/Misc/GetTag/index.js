import { CLASS_COMPONENT, HOST_COMPONENT } from "./../../Constants";

/**
 *  getTag :: ReactElement -> String
 */
export default element => {
  return typeof element.type === "string" ? HOST_COMPONENT : CLASS_COMPONENT;
};
