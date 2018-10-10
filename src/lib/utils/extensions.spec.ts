import { test, TestContext } from 'ava';
import { isDefined, getVal, mergeDeep, crossProps } from './extensions';

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
    function () {
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
});

test(`mergeDeep modifies the target`, t => {
  const EXPECTED_NAME = 'A';
  const objA: any = { name: null };
  const objB: any = {};
  mergeDeep(objA, { name: EXPECTED_NAME });
  mergeDeep({}, objB, { name: EXPECTED_NAME });
  t.is(objA.name, EXPECTED_NAME);
  t.falsy(objB.name);
});

test(`mergeDeep combines flat objects`, t => {
  const objA: any = {
    name: 'A',
    count: 1,
  };
  const objB: any = {
    name: 'B',
    size: 2
  };
  let actualObject = mergeDeep({}, objA, objB);
  t.is(actualObject.name, 'B');
  t.is(actualObject.count, 1);
  t.is(actualObject.size, 2);
});

test(`mergeDeep combines nested objects`, t => {
  const objA: any = {
    root: false,
    childA: {
      childB: {
        name: 'j',
        score: 10
      }
    }
  };
  const objB: any = {
    root: true,
    childA: {
      childB: {
        name: 'c',
        count: 7
      }
    }
  };

  let actualObject = mergeDeep({}, objA, objB);
  t.true(actualObject.root);
  t.is(actualObject.childA.childB.name, 'c');
  t.is(actualObject.childA.childB.score, 10);
  t.is(actualObject.childA.childB.count, 7);
});

test(`mergeDeep ignores non-objects`, t => {
  const objA: any = {
    name: 'A',
    count: 1,
  };
  const objB: any = {
    name: 'B',
    size: 2
  };
  let actualObject = mergeDeep({}, objA, 10, objB);
  t.is(actualObject.name, 'B');
  t.is(actualObject.count, 1);
  t.is(actualObject.size, 2);
});

test(`crossProps handles empty lookups`, t => {  
  const actualResult = crossProps({});
  t.is(actualResult.length, 0);
});

test(`crossProps combines a single array`, t => {
  const lookup = {
    count: [1, 2, 3]
  };
  const expectedResult = [{ count: 1 }, { count: 2 }, { count: 3 }];
  
  const actualResult = crossProps(lookup);
  areEqual(t, actualResult, expectedResult);
});

test(`mergeDeep combines multiple arrays`, t => {
  const lookup = {
    count: [1, 2, 3],
    color: ['red', 'blue']
  };
  const expectedResult = [{ count: 1, color: 'red' }, { count: 1, color: 'blue' },
                          { count: 2, color: 'red' }, { count: 2, color: 'blue' },
                          { count: 3, color: 'red' }, { count: 3, color: 'blue' }];
  
  const actualResult = crossProps(lookup);
  areEqual(t, actualResult, expectedResult);
});

function areEqual<T>(t: TestContext, actual: Array<T>, expected: Array<T>): void {
  t.is(actual.length, expected.length);

  for (let i = 0; i < expected.length;i++) {
    t.deepEqual(actual[i], expected[i]);
  }
}