const styleOrChildrenRegExp = /style|children/;

const isEventListener = prop => prop.startsWith("on");

const isStyleOrChildren = prop => styleOrChildrenRegExp.test(prop);

const addEventListener = (stateNode, props) => prop =>
  stateNode.addEventListener(prop.substr(2).toLowerCase(), props[prop]);

const removeEventListener = (stateNode, props) => prop =>
  stateNode.removeEventListener(prop.substr(2).toLowerCase(), props[prop]);

const isNotEventListenerOrStyleOrChildren = prop =>
  !(isEventListener(prop) || isStyleOrChildren(prop));

const addStyleName = (stateNode, style) => styleName =>
  (stateNode.style[styleName] = style[styleName]);

const removeStyleName = stateNode => styleName =>
  (stateNode.style[styleName] = "");

const copyPropsOver = (stateNode, props) => propName =>
  (stateNode[propName] = props[propName]);

const removeProps = stateNode => propName => (stateNode[propName] = null);

export default (stateNode, oldProps, newProps) => {
  Object.keys(oldProps)
    .filter(isEventListener)
    .forEach(removeEventListener(stateNode, oldProps));

  let oldStlye = oldProps.style || {};

  Object.keys(oldStlye).forEach(removeStyleName(stateNode));

  Object.keys(oldProps)
    .filter(isNotEventListenerOrStyleOrChildren)
    .forEach(removeProps(stateNode));

  Object.keys(newProps)
    .filter(isEventListener)
    .forEach(addEventListener(stateNode, newProps));

  let style = newProps.style || {};

  Object.keys(style).forEach(addStyleName(stateNode, style));

  Object.keys(newProps)
    .filter(isNotEventListenerOrStyleOrChildren)
    .forEach(copyPropsOver(stateNode, newProps));

  return stateNode;
};
