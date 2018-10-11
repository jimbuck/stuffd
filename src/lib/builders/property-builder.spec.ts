import { test } from 'ava';

import { PropertyBuilder } from './property-builder';

import { PropertyDefinition } from '../models/property-definition';
import { CustomGenerator, GuidType } from '../models/types';
import { Model } from '../..';
import { ModelBuilder } from './model-builder';
import { strict } from 'assert';

class TestClass {
  name: string;
  count: number;
}

test(`PropertyBuilder#constructor allows an optional initial definition`, t => {
  t.notThrows(() => newProp());

  const expectedDef: PropertyDefinition = {
    id: 'EmployeeId',
    min: 13,
    max: 13,
    type: String
  };

  const actualDef = newProp(expectedDef)['_definition'];
  t.deepEqual(actualDef, expectedDef);
});

test(`PropertyBuilder.build retuns a copy of the internal property definition`, t => {
  const expectedDef: PropertyDefinition = {
    id: 'EmployeeId',
    min: 13,
    max: 13,
    type: String
  };

  const actualDef = PropertyBuilder.build(newProp(expectedDef));
  t.deepEqual(actualDef, expectedDef);
  t.not(actualDef, expectedDef);
});

test(`PropertyBuilder#key marks the key`, t => {
  const propDef = PropertyBuilder.build(newProp().key());
  t.true(propDef.key);
});

test(`PropertyBuilder#type accepts a type as well as secondary type`, t => {
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

test(`PropertyBuilder#array accepts a type`, t => {

  const primitiveArrayDef = PropertyBuilder.build(newProp().array(String));
  t.is(primitiveArrayDef.type, Array);
  t.is(primitiveArrayDef.secondaryType, String);

  const complexArrayDef = PropertyBuilder.build(newProp().array(TestClass));
  t.is(complexArrayDef.type, Array);
  t.is(complexArrayDef.secondaryType, TestClass);
});

test(`PropertyBuilder#ref accepts a type and optional foreignKey`, t => {
  t.throws(() => PropertyBuilder.build(newProp().ref(TestClass)));

  const expectedExplicitKey = 'name';
  const explicitKeyDef = PropertyBuilder.build(newProp().ref(TestClass, expectedExplicitKey));
  t.is(explicitKeyDef.ref, TestClass);
  t.is(explicitKeyDef.foreignKey, expectedExplicitKey);

  const expectedId = 'InferedTestClass';
  const expectedInferredKey = 'instanceId';
  const InferedTestClass = new ModelBuilder({ id: expectedId }).key(expectedInferredKey, id => id.guid()).build();

  const inferredKeyDef = PropertyBuilder.build(newProp().ref(InferedTestClass));
  t.is(inferredKeyDef.ref, InferedTestClass);
  t.is(inferredKeyDef.foreignKey, expectedInferredKey);
});

test(`PropertyBuilder#range marks the min/max for numbers`, t => {
  const expectedMin = 3;
  const expectedMax = 12;
  const propDef = PropertyBuilder.build(newProp().range(expectedMin, expectedMax));
  t.is(propDef.min, expectedMin);
  t.is(propDef.max, expectedMax);

  t.throws(() => newProp().range(expectedMax, expectedMin));
});

test(`PropertyBuilder#range marks the min/max for dates`, t => {
  const expectedMin = new Date('03/11/1994');
  const expectedMax = new Date('4/16/1999');
  const propDef = PropertyBuilder.build(newProp().range(expectedMin, expectedMax));
  t.is(propDef.min, expectedMin);
  t.is(propDef.max, expectedMax);

  t.throws(() => newProp().range(expectedMax, expectedMin));
});

test(`PropertyBuilder#length sets an equal min/max`, t => {
  const expectedLength = 7;
  const propDef = PropertyBuilder.build(newProp().length(expectedLength));
  t.is(propDef.min, expectedLength);
  t.is(propDef.max, expectedLength);
});

test(`PropertyBuilder#str accepts optional length, min/max or Regexp`, t => {
  const stringPropDef = PropertyBuilder.build(newProp().str(/(hell)o{1,5}/));
  t.is(stringPropDef.type, String);
  t.true(stringPropDef.pattern instanceof RegExp);

  const length = 4;
  const lengthPropDef = PropertyBuilder.build(newProp().str(length));
  t.is(lengthPropDef.type, String);
  t.is(lengthPropDef.min, length);
  t.is(lengthPropDef.min, length);

  const min = 7, max = 10;
  const regexPropDef = PropertyBuilder.build(newProp().str(min, max));
  t.is(regexPropDef.type, String);
  t.is(regexPropDef.min, min);
  t.is(regexPropDef.max, max);

  const defaultPropDef = PropertyBuilder.build(newProp().str());
  t.is(defaultPropDef.type, String);
  t.is(typeof defaultPropDef.pattern, 'undefined');
});

test(`PropertyBuilder#integer accepts min and max values`, t => {
  const defaultPropDef = PropertyBuilder.build(newProp().integer());
  t.is(defaultPropDef.type, Number);
  t.is(defaultPropDef.decimals, 0);
  t.is(defaultPropDef.min, Model.defaults.minInteger);
  t.is(defaultPropDef.max, Model.defaults.maxInteger);

  const expectedMin = 9;
  const expectedMax = 81;
  const customPropDef = PropertyBuilder.build(newProp().integer(expectedMin, expectedMax));
  t.is(customPropDef.type, Number);
  t.is(customPropDef.decimals, 0);
  t.is(customPropDef.min, expectedMin);
  t.is(customPropDef.max, expectedMax);
});

test(`PropertyBuilder#float accepts min and max values`, t => {
  const defaultPropDef = PropertyBuilder.build(newProp().float());
  t.is(defaultPropDef.type, Number);
  t.is(typeof defaultPropDef.decimals, 'undefined');
  t.is(defaultPropDef.min, Model.defaults.minFloat);
  t.is(defaultPropDef.max, Model.defaults.maxFloat);

  let expectedDecimals = 3;
  const decimalsPropDef = PropertyBuilder.build(newProp().float(expectedDecimals));
  t.is(decimalsPropDef.type, Number);
  t.is(decimalsPropDef.decimals, expectedDecimals);
  t.is(decimalsPropDef.min, Model.defaults.minFloat);
  t.is(decimalsPropDef.max, Model.defaults.maxFloat);

  let expectedMin = 0.6;
  let expectedMax = 0.9;
  const customPropDef = PropertyBuilder.build(newProp().float(expectedMin, expectedMax));
  t.is(customPropDef.type, Number);
  t.is(typeof customPropDef.decimals, 'undefined');
  t.is(customPropDef.min, expectedMin);
  t.is(customPropDef.max, expectedMax);

  expectedMin = 0.2;
  expectedMax = 0.4;
  expectedDecimals = 7;
  const customPropDef2 = PropertyBuilder.build(newProp().float(expectedDecimals, expectedMin, expectedMax));
  t.is(customPropDef2.type, Number);
  t.is(customPropDef2.decimals, expectedDecimals);
  t.is(customPropDef2.min, expectedMin);
  t.is(customPropDef2.max, expectedMax);
});

test(`PropertyBuilder#date accepts an optional min/max range`, t => {
  const stdDatePropDef = PropertyBuilder.build(newProp().date());
  t.is(stdDatePropDef.type, Date);

  const minDate = new Date('01/02/2003'), maxDate = new Date('04/05/2006');
  const customDatePropDef = PropertyBuilder.build(newProp().date(minDate, maxDate));
  t.is(customDatePropDef.type, Date);
  t.is(customDatePropDef.min, minDate);
  t.is(customDatePropDef.max, maxDate);
});

test(`PropertyBuilder#guid marks the type as GuidType`, t => {
  const propDef = PropertyBuilder.build(newProp().guid());
  t.is(propDef.type, GuidType);
});

test(`PropertyBuilder#choices accepts an array of options`, t => {
  const expectedChoices = ['red', 'green', 'blue'];
  const propDef = PropertyBuilder.build(newProp().choices(expectedChoices));
  t.deepEqual(propDef.choices, expectedChoices);
});

test(`PropertyBuilder#choices accepts a function that returns an array of options`, t => {
  const expectedChoices = () => ['red', 'green', 'blue'];
  const propDef = PropertyBuilder.build(newProp().choices(expectedChoices));
  t.deepEqual(propDef.choices, expectedChoices);
});

test(`PropertyBuilder#custom accepts custom random generators`, t => {
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

test(`PropertyBuilder can fluently define properties`, t => {
  const expectedId = 'EmployeeId';
  const expectedType = String;
  const expectedLength = 13;

  const actualDef = PropertyBuilder.build(
    newProp({ id: expectedId })
      .key()
      .type(expectedType)
      .length(expectedLength));
  
  t.is(actualDef.id, expectedId);
  t.is(actualDef.type, expectedType);
  t.is(actualDef.min, expectedLength);
  t.is(actualDef.max, expectedLength);
  t.true(actualDef.key);
});

function newProp(initialDef?: PropertyDefinition): PropertyBuilder {
  return new PropertyBuilder(initialDef);
}