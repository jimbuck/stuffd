import { test } from 'ava';

import { PropertyBuilder } from './property-builder';

import { PropertyDefinition } from '../models/property-definition';
import { GuidType, CustomGenerator } from '../models/types';

class TestClass {
  name: string;
  count: number;
}

test(`Property#constructor allows an optional initial definition`, t => {
  t.notThrows(() => newProp());

  const expectedDef: PropertyDefinition = {
    id: 'EmployeeId',
    length: 13,
    type: String
  };

  const actualDef = PropertyBuilder.build(newProp(expectedDef));
  t.is(actualDef.id, expectedDef.id);
  t.is(actualDef.length, expectedDef.length);
  t.is(actualDef.type, actualDef.type);
});

test(`Property#prop can set fluently define properties`, t => {
  const expectedId = 'EmployeeId';
  const expectedType = String;
  const expectedLength = 13;

  const actualDef = PropertyBuilder.build(
    newProp({ id: expectedId })
      .type(expectedType)
      .length(expectedLength));
  
  t.is(actualDef.id, expectedId);
  t.is(actualDef.type, expectedType);
  t.is(actualDef.length, expectedLength);
});

test(`Property#type accepts a type as well as secondary type`, t => {
  const nullTypeDef = PropertyBuilder.build(newProp().type(null));
  t.is(nullTypeDef.type, null);
  t.is(typeof nullTypeDef.secondaryType, 'undefined');

  const singleTypeDef = PropertyBuilder.build(newProp().type(TestClass));
  t.is(singleTypeDef.type, TestClass);
  t.is(typeof singleTypeDef.secondaryType, 'undefined');

  const multiTypeDef = PropertyBuilder.build(newProp().type(Array, String));
  t.is(multiTypeDef.type, Array);
  t.is(multiTypeDef.secondaryType, String);
});

test(`Property can set complex fields properly`, t => {
  const arrayPropDef = PropertyBuilder.build(newProp().array(Number));
  t.is(arrayPropDef.type, Array);
  t.is(arrayPropDef.secondaryType, Number);

  const guidPropDef = PropertyBuilder.build(newProp().guid());
  t.is(guidPropDef.type, GuidType);
});

test(`Property#string accepts min/max length or Regexp or neither`, t => {
  const stringPropDef = PropertyBuilder.build(newProp().string(/(hell)o{1,5}/));
  t.is(stringPropDef.type, String);
  t.true(stringPropDef.pattern instanceof RegExp);

  const min = 7, max = 10;
  const regexPropDef = PropertyBuilder.build(newProp().string(min, max));
  t.is(regexPropDef.type, String);
  t.is(regexPropDef.min, min);
  t.is(regexPropDef.max, max);

  const defaultPropDef = PropertyBuilder.build(newProp().string());
  t.is(defaultPropDef.type, String);
  t.is(typeof defaultPropDef.pattern, 'undefined');
});

test(`Property#integer accepts min and max values`, t => {
  const defaultPropDef = PropertyBuilder.build(newProp().integer());
  t.is(defaultPropDef.type, Number);
  t.is(defaultPropDef.decimals, 0);
  t.is(defaultPropDef.min, 0);
  t.is(defaultPropDef.max, Number.MAX_SAFE_INTEGER);

  const expectedMin = 9;
  const expectedMax = 81;
  const customPropDef = PropertyBuilder.build(newProp().integer(expectedMin, expectedMax));
  t.is(customPropDef.type, Number);
  t.is(customPropDef.decimals, 0);
  t.is(customPropDef.min, expectedMin);
  t.is(customPropDef.max, expectedMax);
});

test(`Property#float accepts min and max values`, t => {
  const defaultPropDef = PropertyBuilder.build(newProp().float());
  t.is(defaultPropDef.type, Number);
  t.is(typeof defaultPropDef.decimals, 'undefined');
  t.is(defaultPropDef.min, Number.MIN_VALUE);
  t.is(defaultPropDef.max, Number.MAX_VALUE);

  const expectedMin = 0.9;
  const expectedMax = 0.81;
  const customPropDef = PropertyBuilder.build(newProp().float(expectedMin, expectedMax));
  t.is(customPropDef.type, Number);
  t.is(typeof customPropDef.decimals, 'undefined');
  t.is(customPropDef.min, expectedMin);
  t.is(customPropDef.max, expectedMax);
});

test(`Property#date accepts an optional min/max range`, t => {
  const stdDatePropDef = PropertyBuilder.build(newProp().date());
  t.is(stdDatePropDef.type, Date);

  const minDate = new Date('01/02/2003'), maxDate = new Date('04/05/2006');
  const customDatePropDef = PropertyBuilder.build(newProp().date(minDate, maxDate));
  t.is(customDatePropDef.type, Date);
  t.is(customDatePropDef.min, minDate);
  t.is(customDatePropDef.max, maxDate);
});

test(`Property#custom accepts custom random generators`, t => {
  const expectedCustomRand: CustomGenerator = (c => c.animal());
  const stdDatePropDef = PropertyBuilder.build(newProp().type(String).custom(expectedCustomRand));
  t.is(stdDatePropDef.type, String);
  t.is(stdDatePropDef.custom, expectedCustomRand);

  const minDate = new Date('01/02/2003'), maxDate = new Date('04/05/2006');
  const customDatePropDef = PropertyBuilder.build(newProp().date(minDate, maxDate));
  t.is(customDatePropDef.type, Date);
  t.is(customDatePropDef.min, minDate);
  t.is(customDatePropDef.max, maxDate);
});

function newProp(initialDef?: PropertyDefinition): PropertyBuilder {
  return new PropertyBuilder(initialDef);
}