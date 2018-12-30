import updateDOMElement from "./updateDOMElement";

/**
 *  createDomElement :: ReactElememt -> DOMNode
 */
export default element => {
  if (element.type === "TEXT_ELEMENT") {
    return document.createTextNode(element.props.nodeValue);
  }

  const domNode = document.createElement(element.type);

  return updateDOMElement(domNode, {}, element.props);
};
