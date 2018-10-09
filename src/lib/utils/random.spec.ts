import { test, TestContext } from 'ava';

import { Random } from './random';

test(`nextInt returns random integers between two values`, t => {
  const rand = new Random(123);
  const min = 7;
  const max = 11;
  repeat(t, 10000, () => {
    let val = rand.nextInt(min, max);
    t.true(val >= min && val <= max, 'int does not fall within range!');
    t.is(val % 1, 0, 'float is missing decimal places!');
  });
});

test(`nextFloat returns random floats between two values`, t => {
  const rand = new Random(123);
  const min = 2.5;
  const max = 3;
  repeat(t, 10000, () => {
    let val = rand.nextFloat(min, max);
    t.true(val >= min && val <= max, 'float does not fall within range!');
    t.not(val % 1, 0, 'float is missing decimal places!');
  });
});

test(`nextDate returns random dates between two values`, t => {
  const rand = new Random(123);
  const min = new Date(2000, 0, 1);
  const max = new Date();
  repeat(t, 10000, () => {
    let val = rand.nextDate(min, max);
    t.true(val >= min && val <= max);
  });
});

test(`guid creates a string`, t => {
  const rand = new Random(123);
  let val = rand.nextGuid();

  t.is(val.length, 32 + 4); // 8 quads plus 4 dashes.
});

test(`identical guids are uncommon`, t => {
  const guids = new Set();
  const rand = new Random(123);
  repeat(t, 10000, () => {
    let val = rand.nextGuid();
    t.false(guids.has(val), 'Guid is a duplicate!');
    
    guids.add(val);
  });
});

function repeat(t: TestContext, count: number, operation: () => void): void {  
  for (let i = 0; i < count; i++) {
    operation();
  }
}