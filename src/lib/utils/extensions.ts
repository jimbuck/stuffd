

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

export function getVal<T>(lazy: T | (() => T)): T {
  return typeof lazy === 'function' ? (lazy as Function)() : lazy;
}

/**
 * Deep merge two objects.
 */
export function mergeDeep<T>(target: T, ...sources: T[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject<T>(item: T): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}