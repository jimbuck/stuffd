import { test, ContextualTestContext } from 'ava';

import { Rand } from './rand';

test(`next returns random decimal between 0 and 1`, t => {
  const rand = new Rand(123);
  const min = 0;
  const max = 1;
  repeat(t, 1000000, () => {
    let val = rand.next();
    return val >= min && val < max;
  });
});

test(`nextInt returns random integers between two values`, t => {
  const rand = new Rand(123);
  const min = 7;
  const max = 11;
  repeat(t, 1000000, () => {
    let val = rand.nextInt(min, max);
    return val >= min && val < max && (val - Math.floor(val) === 0);
  });
});

test(`nextFloat returns random floats between two values`, t => {
  const rand = new Rand(123);
  const min = 2.5;
  const max = 3;
  repeat(t, 1000000, () => {
    let val = rand.nextFloat(min, max);
    return val >= min && val < max && (val - Math.floor(val) !== 0);
  });
});

test(`nextDate returns random dates between two values`, t => {
  const rand = new Rand(123);
  const min = new Date(2000, 0, 1);
  const max = new Date();
  repeat(t, 1000000, () => {
    let val = rand.nextDate(min, max);
    return val >= min && val < max;
  });
});

function repeat(t: ContextualTestContext, count: number, operation: () => boolean): void {  
  for (let i = 0; i < count; i++) {
    if (!operation()) {
      return t.fail();
    }
  }

  t.pass();
}