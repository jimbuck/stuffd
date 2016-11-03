

/**
 * Returns false if the value is null or undefined, otherwise returns true.
 * 
 * @export
 * @param {*} val The object to test.
 * @returns {boolean}
 */
export function isDefined(val: any): boolean {
  return val !== null && typeof val !== 'undefined';
}