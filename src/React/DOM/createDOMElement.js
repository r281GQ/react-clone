import updateDOMElement from "./updateDOMElement";

export default fiber => {
  if (fiber.type === "TEXT_ELEMENT") {
    return document.createTextNode(fiber.props.nodeValue);
  }

  const element = document.createElement(fiber.type);

  return updateDOMElement(element, {}, fiber.props);
};
