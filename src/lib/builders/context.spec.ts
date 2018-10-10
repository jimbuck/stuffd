import { test } from 'ava';

import { Context } from './context';

test('Context optionally accepts a seed.', t => {
  let ctx1 = new Context();
  t.true(ctx1 instanceof Context);
  t.is(typeof ctx1.seed, 'number');

  const EXPECTED_SEED = 123;
  let ctx2 = new Context(EXPECTED_SEED);
  t.true(ctx2 instanceof Context);
  t.is(ctx2.seed, EXPECTED_SEED);
});

