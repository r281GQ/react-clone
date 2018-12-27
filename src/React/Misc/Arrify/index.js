/**
 *  arrify :: (a | [a]) -> [a]
 */
export default value => (Array.isArray(value) ? value : [value]);
