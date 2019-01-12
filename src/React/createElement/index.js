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

  let f = args.map(
    child => {
      // console.log(child);

      if (Array.isArray(child))
        return child.map(x => ({ ...x, isArray: true }));

      return child;
    }
    // Array.isArray(child) ? { ...child, isArray: true } : child
  );

  const rawChildren = hasChildren ? [].concat(...f) : [];

  // const rawChildren = hasChildren ? [].concat(...args) : [];
  // console.log(rawChildren);
  /**
   *  Filter out falsy elements. Return the child itself if that is a Class/Function component.
   *  Create text element otherwise.
   */
  props.children = rawChildren
    .filter(c => c != null)
    .map(c => {
      if (c === false) {
        return null;
      }

      const child = c instanceof Object ? c : createTextElement(c);

      // console.log(child);

      return child;
    });
  return { type, props };
};

export default createElement;
