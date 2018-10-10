import { Lookup } from '../models/dictionary';


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


export function crossProps(data: Lookup<any[]>): any[] {
  let keys = Object.keys(data);
  if (keys.length === 0) return [];
  if (keys.length === 1) return data[keys[0]].map(val => ({ [keys[0]]: val }));
  
  let values = [...keys.map(key => data[key].map(value => ({ key, value })))];
  let products = _cartesian(...values);

  return products.map(product => product.reduce((obj: Lookup<any>, next: { key: string, value: any }) => Object.assign(obj, { [next.key]: next.value }), {}));
}
function _crossTwo(a: any[], b: any[]): any[][] {
  return [].concat(...a.map(aItem => b.map(bItem => [].concat(aItem, bItem))));
}
function _cartesian(...data: any[][]): any[][] {
  const [a, b, ...c] = data;
  return b ? _cartesian(_crossTwo(a, b), ...c) : a;
}