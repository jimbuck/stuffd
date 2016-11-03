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
  const existingKey = 'exists';
  const existingValue = 'this is a value';
  const overwrittenValue = 'this is a new value';
  const nonExistentKey = 'doesNotExist';
  const brandNewValue = 'brand new value';

  let d = new Dictionary({
    [existingKey]: existingValue
  });

  d.set(nonExistentKey, brandNewValue);
  t.is(d.get(nonExistentKey), brandNewValue);  

  d.set(existingKey, overwrittenValue);
  t.is(d.get(existingKey), overwrittenValue);
});

