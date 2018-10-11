import { test } from 'ava';

import { Context } from './context';

test(`Optionally accepts a seed`, t => {
  let ctx1 = new Context();
  t.true(ctx1 instanceof Context);
  t.is(typeof ctx1.seed, 'number');

  const EXPECTED_SEED = 123;
  let ctx2 = new Context(EXPECTED_SEED);
  t.true(ctx2 instanceof Context);
  t.is(ctx2.seed, EXPECTED_SEED);
});

test.todo(`Context#using returns a populated CollectionBuilder`);

test.todo(`Context#cross returns a populated CollectionBuilder`);

test.todo(`Context#create returns a populated array`);

test.todo(`Context#clear empties out the activator's cache`);

test.todo(`Context#json returns a string of the generated data`);

test.todo(`Context#json accepts a format flag`);

test.todo(`Context#json accepts a format character`);

test.todo(`Context#data returns a clone of the generated data`);