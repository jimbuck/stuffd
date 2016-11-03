import { test } from 'ava';

import { guid } from './guid';

test(`guid creates a string`, t => {
  let val = guid();

  t.is(val.length, 32 + 4); // 8 quads plus 4 dashes.
});

test(`identical guids are uncommon`, t => {
  let guids = new Set();
  const totalTries = 1000000;
  const maxDupRate = 0.0001; // Duplication rate of 0.01%
  let dupCount = 0;
  for (let i = 0; i < 100; i++) {
    let val = guid();

    if (!guids.has(val)) {
      guids.add(val);
    } else {
      dupCount++;
    }
  }

  let actualDupRate = dupCount / totalTries;
  t.true(actualDupRate <= maxDupRate, `Duplication rate of ${actualDupRate} is greater than ${maxDupRate} threshold`);
});