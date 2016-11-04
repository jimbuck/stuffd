import { test } from 'ava';

import { OrderDefinition } from './order-definition';

test(`OrderDefinition#constructor requires a quantity greater than 0`, t => {
  t.notThrows(() => new OrderDefinition(String, 1));
  t.notThrows(() => new OrderDefinition(String, 2));
  t.notThrows(() => new OrderDefinition(String, 100000));
  t.throws(() => new OrderDefinition(String, 0));
  t.throws(() => new OrderDefinition(String, -1));
  t.throws(() => new OrderDefinition(String, -999));

  const expectedQuantity = 4;
  let od = new OrderDefinition(String, expectedQuantity);
  t.is(od.quantity, expectedQuantity);
});