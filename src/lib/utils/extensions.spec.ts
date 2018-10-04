import { test } from 'ava';
import { isDefined, getVal } from './extensions';

test(`isDefined returns true for primitives`, t => {
  [true, false, 0, 1, 2, Number.POSITIVE_INFINITY, Number.NaN, '', 'hello']
    .forEach(val => t.true(isDefined(val)));
});

test(`isDefined return true for complex types`, t => {
  [/test/gi, new Date(), { name: 'Jim' }, [1, 2, 3]]
    .forEach(val => t.true(isDefined(val)));
});

test(`isDefined returns false for null and undefined`, t => {
  let undefinedVal: any = [][0];
  [null, undefinedVal]
    .forEach(val => t.false(isDefined(val)));
});

test(`getVal returns the value when primitive`, t => {
  [true, false, 0, 1, 2, Number.POSITIVE_INFINITY, Number.NaN, '', 'hello']
    .forEach(val => {
      if (typeof val === 'number' && Number.isNaN(val)) {
        t.true(Number.isNaN(getVal(val)));
      } else {
        t.is(val, getVal(val));
      }
    });
});

test(`getVal return true for complex types`, t => {
  [/test/gi, new Date(), { name: 'Jim' }, [1, 2, 3]]
    .forEach(val => t.is(val, getVal(val)));
});

test(`getVal returns false for null and undefined`, t => {
  let undefinedVal: any = [][0];
  [null, undefinedVal]
    .forEach(val => t.is(val, getVal(val)));
});

test(`getVal returns the result of a function`, t => {
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
    let val = getVal<any>(fn);
    t.not(val, fn);
  })
})