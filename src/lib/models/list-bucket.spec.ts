import { test } from 'ava';

import { ListBucket } from './list-bucket';

test(`get and add properly manipulate the bucket`, t => {
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedRound1 = [1, 3, 5];
  let expectedRound2 = [2, 4, 6];
  let actualRound1 = bucket.get(key);
  t.is(actualRound1.length, 0);
  bucket['_data'][key] = expectedRound1;
  let actualRound2 = bucket.get(key);
  t.deepEqual(actualRound2, expectedRound1);
  let addResult = bucket.add(key, expectedRound2);
  t.is(addResult, expectedRound2);
  let actualRound3 = bucket.get(key);
  t.deepEqual(actualRound3, [...expectedRound1, ...expectedRound2]);
});

test(`ListBucket#ledger provides history of objects`, t => {
  const key = 'nums';
  let bucket = new ListBucket(true);
  let expectedValues = [1, 3, 5];
  bucket.add(key, [expectedValues[0]]);
  bucket.add(key, [expectedValues[1]]);
  bucket.add(key, [expectedValues[2]]);
  let data = bucket.get(key);
  t.is(data.length, 3);
  t.deepEqual(data, expectedValues);
  t.deepEqual(bucket.ledger, expectedValues.map(value => ({ key, value })));
});

test(`ListBucket#ledger is null when not tracked`, t => {
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedValues = [1, 3, 5];
  bucket.add(key, [expectedValues[0]]);
  bucket.add(key, [expectedValues[1]]);
  bucket.add(key, [expectedValues[2]]);
  let data = bucket.get(key);
  t.is(data.length, 3);
  t.deepEqual(data, expectedValues);
  t.is(bucket.ledger, null);
});

test(`ListBucket#clear empties the stored data`, t => {
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedRound1 = [1, 3, 5];
  let expectedRound2 = [2, 4, 6];
  bucket.add(key, expectedRound1);
  bucket.add(key, expectedRound2);
  let data = bucket.get(key);
  t.is(data.length, 6);
  bucket.clear();
  data = bucket.get(key);
  t.is(data.length, 0);
});

test(`ListBucket#clear resets the ledger`, t => {
  const key = 'nums';
  let bucket = new ListBucket(true);
  let expectedRound1 = [1, 3, 5];
  let expectedRound2 = [2, 4, 6];
  bucket.add(key, expectedRound1);
  bucket.add(key, expectedRound2);
  t.deepEqual(bucket.ledger, [...expectedRound1, ...expectedRound2].map(value => ({ key, value })));
  bucket.clear();
  t.deepEqual(bucket.ledger, []);
});

test(`ListBucket#toJSON`, t => {
  const expectedJson = `{"nums":[1,3,5,2,4,6]}`;
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedRound1 = [1, 3, 5];
  let expectedRound2 = [2, 4, 6];
  bucket.add(key, expectedRound1);
  bucket.add(key, expectedRound2);
  let data = bucket.get(key);
  t.is(data.length, 6);
  let actualJson = JSON.stringify(bucket);
  t.is(actualJson, expectedJson);
});

test(`ListBucket#forEachKey`, t => {
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedRound1 = [1, 3, 5];
  let expectedRound2 = [2, 4, 6];
  bucket.add(key, expectedRound1);
  bucket.add(key, expectedRound2);
  let data = bucket.get(key);
  t.is(data.length, 6);
});