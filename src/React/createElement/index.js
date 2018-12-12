const TEXT_ELEMENT = "TEXT_ELEMENT";

/**
 *  createTextElement :: String -> ReactElement
 *
 *  If the value of the child is String it creates the appropriate format for the Element
 */
const createTextElement = value =>
  createElement(TEXT_ELEMENT, { nodeValue: value });

const createElement = (type, config, ...args) => {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;

  /**
   *  If the children array's first element is a function it is a Function as children.
   */
  if (typeof args[0] === "function") {
    props.children = args[0];
    return { type, props };
  }

  const rawChildren = hasChildren ? [].concat(...args) : [];

  /**
   *  Filter out falsy elements. Return the child itself if that is a Class/Function component.
   *  Create text element otherwise.
   */
  props.children = rawChildren
    .filter(c => c != null && c !== false)
    .map(c => (c instanceof Object ? c : createTextElement(c)));
  return { type, props };
};

export default createElement;
