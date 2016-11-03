import { test } from 'ava';
import { isDefined } from './extensions';

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