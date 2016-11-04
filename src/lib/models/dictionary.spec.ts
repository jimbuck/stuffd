import { test } from 'ava';

import { Lookup, Dictionary } from './dictionary';

test(`Dictionary has optional initial store`, t => {
  t.notThrows(() => new Dictionary());
  t.notThrows(() => new Dictionary({ stuff: 'things' }));
});

test(`Dictionary#get retrieves the value`, t => {
  const propName = 'color';
  const initialStore = {
    [propName]: 'yellow'
  };

  const d = new Dictionary(initialStore);
  t.is(d.get(propName), initialStore[propName]);
});

test(`Dictionary#hasKey properly checks for keys`, t => {
  const existingKey = 'exists';
  const nonExistentKey = 'doesNotExist';
  
  let d = new Dictionary({
    [existingKey]: 'this is a value'
  });

  t.true(d.hasKey(existingKey));
  t.false(d.hasKey(nonExistentKey));
});

test(`Dictionary#getKey properly finds keys from objects`, t => {
  const existingKey = 'exists';
  const existingValue = 'this value exists!';
  const nonExistentValue = 'doesNotExist';
  
  let d = new Dictionary({
    [existingKey]: existingValue
  });
  
  t.is(d.getKey(existingValue), existingKey);
  t.is(typeof d.getKey(nonExistentValue), 'undefined');
});

test(`Dictionary#getOrAdd calls factory if key does not exist`, t => {
  const existingKey = 'exists';
  const existingValue = 'this is a value';
  const nonExistentKey = 'doesNotExist';
  const factoryValue = 'factory value!';

  let d = new Dictionary({
    [existingKey]: existingValue
  });

  const actualExistingValue = d.getOrAdd(existingKey, () => {
    t.fail();
    return null;
  });
  t.is(actualExistingValue, existingValue);

  const actualNonexistentValue = d.getOrAdd(nonExistentKey, () => factoryValue);
  t.is(actualNonexistentValue, factoryValue);  
});

test(`Dictionary#set adds or overwrites values`, t => {
  const {d, existingKey, existingValue, nonExistentKey, nonExistentValue} = createTestDictionary();
  const overwrittenValue = { answer: 42 };
  const brandNewValue = { answer: 99 };

  t.false(d.hasKey(nonExistentKey));  
  d.set(nonExistentKey, brandNewValue);
  t.is(d.get(nonExistentKey), brandNewValue);  

  t.is(d.get(existingKey), existingValue);  
  d.set(existingKey, overwrittenValue);
  t.is(d.get(existingKey), overwrittenValue);
});

test(`Dictionary#has properly checks for values`, t => {
  const {d, existingValue, nonExistentValue} = createTestDictionary();

  t.true(d.has(existingValue));
  t.false(d.has(nonExistentValue));
});

test(`Dictionary#delete removes based on key`, t => {
  const {d, existingKey, nonExistentKey} = createTestDictionary();

  t.true(d.hasKey(existingKey));
  t.notThrows(() => d.delete(existingKey));
  t.false(d.hasKey(existingKey));

  t.notThrows(() => d.delete(nonExistentKey));
});

test(`Dictionary#forEach iterates over each key-value-pair`, t => {
  const { keyValuePairs, d } = createTestDictionary();

  let remainingKeyValuePairs = keyValuePairs.map(x => x.value);

  d.forEach((val, key) => {
    let i = remainingKeyValuePairs.indexOf(val);
    t.true(i > -1);
    remainingKeyValuePairs.splice(i, 1);
  });

  t.is(remainingKeyValuePairs.length, 0);
});

test(`Dictionary#map converts each key-value-pair`, t => {
  const { keyValuePairs, d } = createTestDictionary();
  const expectedArray = keyValuePairs.map(x => x.value.answer * 10);

  let remainingKeyValuePairs = keyValuePairs.map(x => x.value);

  let resultingArray = d.map((val, key) => {
    return val.answer * 10;
  });
  
  t.deepEqual(resultingArray, expectedArray);
});

test(`Dictionary#find returns the first matching item`, t => {
  const { keyValuePairs, d } = createTestDictionary();
  const expectedItem = keyValuePairs[1].value;

  let remainingKeyValuePairs = keyValuePairs.map(x => x.value);

  let actualItem = d.find((val, key) => {
    return val.answer % 2 === 0;
  });
  
  t.is(actualItem, expectedItem);

  let undefinedItem = d.find(() => false);

  t.is(typeof undefinedItem, 'undefined');
});

test(`Dictionary#findKey returns the first matching key`, t => {
  const { keyValuePairs, d } = createTestDictionary();
  const expectedKey = keyValuePairs[1].key;

  let remainingKeyValuePairs = keyValuePairs.map(x => x.value);

  let actualKey = d.findKey((val, key) => {
    return val.answer % 2 === 0;
  });
  
  t.is(actualKey, expectedKey);

  let undefinedKey = d.findKey(() => false);

  t.is(typeof undefinedKey, 'undefined');
});

function createTestDictionary() {
  const existingKey = 'key1';
  const existingValue = { answer: 1 };
  const nonExistentKey = 'nonExistentKey';
  const nonExistentValue = { answer: -1 };

  const keyValuePairs = [
    { key: existingKey, value: existingValue },
    { key: 'key2', value: { answer: 2 } },
    { key: 'key3', value: { answer: 3 } },
    { key: 'key4', value: { answer: 4 } }
  ];

  const initStore: Lookup<{ answer: number }> = {};
  keyValuePairs.forEach(kvp => {
    initStore[kvp.key] = kvp.value;
  });

  const d = new Dictionary(initStore);

  return { keyValuePairs, d, existingKey, existingValue, nonExistentKey, nonExistentValue };
}