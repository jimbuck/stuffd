import { test } from 'ava';

import { lazyVal, Lazy } from './types';

test(`lazyVal returns the value when primitive`, t => {
  [true, false, 0, 1, 2, Number.POSITIVE_INFINITY, Number.NaN, '', 'hello']
    .forEach(val => {
      if (typeof val === 'number' && Number.isNaN(val)) {
        t.true(Number.isNaN(lazyVal(val)));
      } else {
        t.is(val, lazyVal(val));
      }
    });
});

test(`lazyVal return true for complex types`, t => {
  [/test/gi, new Date(), { name: 'Jim' }, [1, 2, 3]]
    .forEach(val => t.is(val, lazyVal(val)));
});

test(`lazyVal returns false for null and undefined`, t => {
  let undefinedVal: any = [][0];
  [null, undefinedVal]
    .forEach(val => t.is(val, lazyVal(val)));
});

test(`lazyVal returns the result of a function`, t => {
  [
    () => false,
    () => 42,
    () => new Date(),
    function() {
      return {
        d: new Date(),
        n: Math.random(),
        s: 'hi'
      };
    },
    function noop() { }
  ].forEach(fn => {
    let val = lazyVal<any>(fn);
    t.not(val, fn);
  })
})