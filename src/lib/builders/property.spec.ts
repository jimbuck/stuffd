import { test } from 'ava';

import { Property } from './property';

import { PropertyDefinition } from '../models/property-definition';
import { Guid } from '../models/types';

test(`Property#constructor allows an optional initial definition`, t => {
  t.notThrows(newProp);

  const expectedDef: PropertyDefinition = {
    name: 'test-property',
    length: 42,
    type: Date
  };

  const actualDef = newProp(expectedDef).build();
  t.is(actualDef.name, expectedDef.name);
  t.is(actualDef.length, expectedDef.length);
  t.is(actualDef.type, actualDef.type);
});

test(`Property can set simple fields properly`, t => {
  const simpleProps: PropertyDefinition = {
    name: 'someName',
    key: true,
    ref: Date,
    min: -4,
    max: 8,
    length: 9,
    decimals: 80,
    choices: ['a', 'b','c', 1, 2, 3]
  };
  
  Object.keys(simpleProps).map(name => { 
    return { prop: name, value: (simpleProps as any)[name] };
  }).forEach(({prop, value}) => {
      const p = newProp() as any;
      const actualDef = p[prop](value).build();
      t.is(actualDef[prop], value);
  });
});

test(`Property#type accepts a type as well as secondary type`, t => {
  const nullTypeDef = newProp().type(null).build();
  t.is(nullTypeDef.type, null);
  t.is(typeof nullTypeDef.secondaryType, 'undefined');

  const singleTypeDef = newProp().type(RegExp).build();
  t.is(singleTypeDef.type, RegExp);
  t.is(typeof singleTypeDef.secondaryType, 'undefined');

  const multiTypeDef = newProp().type(Array, String).build();
  t.is(multiTypeDef.type, Array);
  t.is(multiTypeDef.secondaryType, String);
});

test(`Property can set complex fields properly`, t => {
  const arrayPropDef = newProp().array(Number).build();
  t.is(arrayPropDef.type, Array);
  t.is(arrayPropDef.secondaryType, Number);

  const guidPropDef = newProp().guid().build();
  t.is(guidPropDef.type, Guid);
});

test(`Property#string accepts strings, Regexp, or neither`, t => {
  const stringPropDef = newProp().string('StrTest').build();
  t.is(stringPropDef.type, String);
  t.true(stringPropDef.pattern instanceof RegExp);

  const regex = new RegExp('regexTest');
  const regexPropDef = newProp().string(regex).build();
  t.is(regexPropDef.type, String);
  t.deepEqual(regexPropDef.pattern, regex);

  const defaultPropDef = newProp().string().build();
  t.is(defaultPropDef.type, String);
  t.is(typeof defaultPropDef.pattern, 'undefined');
});

test(`Property#integer accepts min and max values`, t => {
  const defaultPropDef = newProp().integer().build();
  t.is(defaultPropDef.type, Number);
  t.is(defaultPropDef.decimals, 0);
  t.is(defaultPropDef.min, 0);
  t.is(defaultPropDef.max, Number.MAX_SAFE_INTEGER);

  const expectedMin = 9;
  const expectedMax = 81;
  const customPropDef = newProp().integer(expectedMin, expectedMax).build();
  t.is(customPropDef.type, Number);
  t.is(customPropDef.decimals, 0);
  t.is(customPropDef.min, expectedMin);
  t.is(customPropDef.max, expectedMax);
});

test(`Property#float accepts min and max values`, t => {
  const defaultPropDef = newProp().float().build();
  t.is(defaultPropDef.type, Number);
  t.is(typeof defaultPropDef.decimals, 'undefined');
  t.is(defaultPropDef.min, Number.MIN_VALUE);
  t.is(defaultPropDef.max, Number.MAX_VALUE);

  const expectedMin = 0.9;
  const expectedMax = 0.81;
  const customPropDef = newProp().float(expectedMin, expectedMax).build();
  t.is(customPropDef.type, Number);
  t.is(typeof customPropDef.decimals, 'undefined');
  t.is(customPropDef.min, expectedMin);
  t.is(customPropDef.max, expectedMax);
});

function newProp(initialDef?: PropertyDefinition): Property {
  return new Property(initialDef);
}