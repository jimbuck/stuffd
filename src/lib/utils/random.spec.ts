import { test, TestContext } from 'ava';

import { Random } from './random';

const globalRepeatCount = 10000;

test(`Random#nextInt returns random integers between two values`, t => {
  const rand = new Random();
  const min = 7;
  const max = 11;
  repeat(() => {
    let val = rand.nextInt(min, max);
    t.true(val >= min && val <= max, 'int does not fall within range!');
    t.is(val % 1, 0, 'float is missing decimal places!');
  });
});

test(`Random#nextFloat returns random floats between two values`, t => {
  const rand = new Random();
  const min = 2.5;
  const max = 3;
  repeat(() => {
    let val = rand.nextFloat(min, max);
    t.true(val >= min && val <= max, 'float does not fall within range!');
    t.not(val % 1, 0, 'float is missing decimal places!');
  });
});

test(`Random#nextDate returns random dates between two values`, t => {
  const rand = new Random();
  const min = new Date(2000, 0, 1);
  const max = new Date();
  repeat(() => {
    let val = rand.nextDate(min, max);
    t.true(val >= min && val <= max);
  });
});

test(`Random#nextGuid creates a string`, t => {
  const rand = new Random();

  repeat(() => {
    let val = rand.nextGuid();
    t.is(val.length, 32 + 4); // 8 quads plus 4 dashes.
  })
});

test(`Random#nextBoolean defaults to an evenly weighted result`, t => {
  let total = 99999;
  let trueCount = 0;
  const rand = new Random();
  repeat(() => {
    if (rand.nextBoolean()) trueCount++;
  }, total);
  let actualTruthRate = Math.round(10 * trueCount / total) / 10;
  t.is(actualTruthRate, 0.5);
});

test(`Random#nextBoolean returns an weighted boolean`, t => {
  let total = 99999;
  let trueCount = 0;
  const rand = new Random();
  const truthRate = 0.7;
  repeat(() => {
    if (rand.nextBoolean(truthRate)) trueCount++;
  }, total);
  let actualTruthRate = Math.round(10 * trueCount / total) / 10;
  t.is(actualTruthRate, truthRate);
});

test(`Random#nextString creates a string`, t => {
  const rand = new Random();
  let stdLengthStr = rand.nextString();
  t.is(stdLengthStr.length, 8);
  const expectedLength = 24;
  let customLengthStr = rand.nextString(expectedLength);
  t.is(customLengthStr.length, expectedLength);
});

test(`Random#chance allows for custom randoms`, t => {
  const rand = new Random();
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

  repeat(() => {
    let val = rand.chance(c => c.phone());
    t.is(val.length, 14);
    t.true(phoneRegex.test(val));
  });
});

test(`Random#choice requires at least one item in the list`, t => {
  const rand = new Random();
  const choices: any[] = [];
  t.throws(() => rand.choice(choices));
});
test(`Random#choice picks one item from a list`, t => {
  const rand = new Random();
  const choices = [1, 'red', false];
  repeat(() => {
    let val = rand.choice(choices);
    t.true(val === 1 || val === 'red' || val === false);
  });
});

test(`Random#nextPattern picks one item from a list`, t => {
  const rand = new Random();
  const pattern = /^\(\d{3}\) \d{3}-\d{4}$/;
  repeat(() => {
    let val = rand.nextPattern(pattern);
    t.true(pattern.test(val));
  });
});

function repeat(operation: () => void, count: number = globalRepeatCount): void {  
  for (let i = 0; i < count; i++) {
    operation();
  }
}