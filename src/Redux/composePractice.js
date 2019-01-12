let fst = "some string";

let snd = fst.toUpperCase();

let thd = snd.concat("bacon");

let fth = thd.startsWith("B");

/**
 *  makeItUpperCase :: String -> String
 */
const makeItUpperCase = x => x.toUpperCase();

/**
 *  addString :: String -> String -> String
 */
const addString = y => x => x.concat(y);

/**
 *  startWithString :: String -> String -> Boolean
 */
const startWithString = y => x => x.startsWith(y);

/**
 *  addBacon :: String -> String
 */
const addBacon = addString("bacon");

/**
 *  startWithB :: String -> Boolean
 */
const startWithB = startWithString("B");

/**
 *  compose :: ((y -> z), ..., (a -> b)) -> a -> z
 */
const compose = (...fn) => value =>
  fn.reduceRight((value, fn) => fn(value), value);

/**
 *  createStringAndCheckForB :: String -> Boolean
 */
const createStringAndCheckForB = compose(
  startWithB,
  addBacon,
  makeItUpperCase
);

const adder = x => y => x + y;

const loggerFn = c => c(4);

const whatever = compose(
  loggerFn,
  adder
)(1);

const result = createStringAndCheckForB("Bsdfsdfsd");
