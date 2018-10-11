import { test } from 'ava';

import { ListBucket } from './list-bucket';

test(`get, set, and add properly manipulate the bucket`, t => {
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedRound1 = [1, 3, 5];
  let expectedRound2 = [2, 4, 6];
  bucket.set(key, expectedRound1);
  let actualRound1 = bucket.get(key);
  t.deepEqual(actualRound1, expectedRound1);
  let addResult = bucket.add(key, expectedRound2);
  t.is(addResult, expectedRound2);
  let actualRound2 = bucket.get(key);
  t.deepEqual(actualRound2, [...expectedRound1, ...expectedRound2]);
  bucket.set(key, []);
  let actualRound3 = bucket.get(key);
  t.is(actualRound3.length, 0);
});

test(`set with an empty array resets the list`, t => {
  const key = 'nums';
  let bucket = new ListBucket();
  let expectedRound1 = [1, 3, 5];
  let expectedRound2: number[];
  bucket.set(key, expectedRound1);
  let actualRound1 = bucket.get(key);
  t.deepEqual(actualRound1, expectedRound1);
  let setResult = bucket.set(key, expectedRound2);
  t.is(setResult, expectedRound2);
  let actualRound2 = bucket.get(key);
  t.deepEqual(actualRound2, []);
});

test(`ListBucket#clear`, t => {
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