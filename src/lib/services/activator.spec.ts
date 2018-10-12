import { test, GenericTestContext, Context } from 'ava';
import { Activator } from './activator';
import { PropertyDefinition } from '../models/property-definition';
import { setModelDef } from '../utils/meta-reader';
import { Model } from '../..';
import { GuidType } from '../models/types';
import { StoredEnum } from '../models/stored-enum';

const sillyNameRegex = new RegExp(/(JKTSMP){1}im/);
class TestClass {
  name: string;
  count: number;
}

test.before(() => {
  setModelDef(TestClass, {
    name: 'TestClass',
    primaryKey: 'name',
    props: {
      'name': { key: true, type: String, designType: String, pattern: sillyNameRegex },
      'count': { designType: Number, type: Number, min: 0, max: 100 }
    }
  });
})

enum LightSwitch {
  Off, On
}
const lightSwitchEnum = new StoredEnum(LightSwitch);

function validateTestClass(t: GenericTestContext<Context<any>>, obj: TestClass) {
  t.true(
    (sillyNameRegex.test(obj.name)) &&
    (obj.count >= 0 || obj.count <= 100 && Math.floor(obj.count) === obj.count), `${JSON.stringify(obj)} is invalid!`);
}

test(`Activator creates random seed`, t => {
  const activator1 = new Activator();
  t.is(typeof activator1.seed, 'number');
  const activator2 = new Activator();
  t.is(typeof activator2.seed, 'number');
  t.not(activator1.seed, activator2.seed);
});

test(`Activator optionally accepts a seed`, t => {
  const expectedSeed = 123;
  const activator = new Activator(expectedSeed);
  t.is(typeof activator.seed, 'number');
  t.is(activator.seed, expectedSeed);
});

[
  {
    name: 'pick types',
    propDef: { pick: ['red', 'blue', 'green'] } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(['red', 'blue', 'green'].includes(value));
    }
  },
  {
    name: 'custom generators',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'references to other instances',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'enums as numbers',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'enums as strings',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'booleans',
    times: 10000,
    propDef: { designType: Boolean, type: Boolean, truthRate: 0.7 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: boolean) {
      let trueCount = t.context.trueCount || 0;
      let totalCount = t.context.totalCount || 0;
      t.is(typeof value, 'boolean');
      totalCount++;
      if (value) trueCount++;

      t.context.totalCount = totalCount;
      t.context.trueCount = trueCount;

      if (totalCount >= 5000) {
        t.is(Math.round(10 * trueCount / totalCount) / 10, 0.7);
      }
    }
  },
  {
    name: 'integers (with min/max)',
    propDef: { designType: Number, type: Number, decimals: 0, min: 4, max: 24 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= 4, `Expected: >=4, actual: ${value}`);
      t.true(value <= 24, `Expected: <=24, actual: ${value}`);
      t.is(value, Math.floor(value));
    }
  },
  {
    name: 'integers (without min/max)',
    propDef: { designType: Number, type: Number, decimals: 0 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= Model.defaults.minInteger, `Expected: >=${Model.defaults.minInteger}, actual: ${value}`);
      t.true(value <= Model.defaults.maxInteger, `Expected: <=${Model.defaults.maxInteger}, actual: ${value}`);
      t.is(value, Math.floor(value));
    }
  },
  {
    name: 'floats (with fixed decimals)',
    propDef: { designType: Number, type: Number, decimals: 6 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= Model.defaults.minFloat, `Expected: >=${Model.defaults.minFloat}, actual: ${value}`);
      t.true(value <= Model.defaults.maxFloat, `Expected: <=${Model.defaults.maxFloat}, actual: ${value}`);
      t.true(getDecimalCount(value) <= 6);
    }
  },
  {
    name: 'floats (with min/max)',
    propDef: { designType: Number, type: Number, min: 4, max: 24 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= Model.defaults.minFloat, `Expected: >=${Model.defaults.minFloat}, actual: ${value}`);
      t.true(value <= Model.defaults.maxFloat, `Expected: <=${Model.defaults.maxFloat}, actual: ${value}`);
      t.true(getDecimalCount(value) <= Model.defaults.maxFloatDecimals);
    }
  },
  {
    name: 'floats (with fixed decimals and min/max)',
    propDef: { designType: Number, type: Number, decimals: 5, min: 2.6, max: 4.1 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= 2.6, `Expected: >=${2.6}, actual: ${value}`);
      t.true(value <= 4.1, `Expected: <=${4.1}, actual: ${value}`);
      t.true(getDecimalCount(value) <= 5);
    }
  },
  {
    name: 'dates (without min/max)',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'dates (with min/max)',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'strings (without min/max)',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'strings (with pattern)',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'strings (with min/max)',
    propDef: {  } as PropertyDefinition,
  },
  {
    name: 'number arrays (with min/max)',
    propDef: { type: Array, secondaryType: Number, min: 3, max: 12 } as PropertyDefinition,
  },
  {
    name: 'number arrays (without min/max)',
    propDef: { type: Array, secondaryType: Number } as PropertyDefinition,
  },
  {
    name: 'guid arrays (with min/max)',
    propDef: { type: Array, secondaryType: GuidType, min: 3, max: 12 } as PropertyDefinition,
  },
  {
    name: 'guid arrays (without min/max)',
    propDef: { type: Array, secondaryType: GuidType } as PropertyDefinition,
  },
  {
    name: 'enum arrays (with min/max)',
    propDef: { type: Array, secondaryType: lightSwitchEnum, min: 3, max: 12 } as PropertyDefinition,
  },
  {
    name: 'enum arrays (without min/max)',
    propDef: { type: Array, secondaryType: lightSwitchEnum } as PropertyDefinition,
  },
  {
    name: 'complex arrays (with min/max)',
    propDef: { type: Array, secondaryType: TestClass, min: 3, max: 12 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: TestClass[]) {
      t.true(value.length >= 3, `Expected: >=3, actual: ${value.length}`);
      t.true(value.length <= 12, `Expected: <=12, actual: ${value.length}`);
      value.forEach(item => validateTestClass(t, item));
    }
  },
  {
    name: 'complex arrays (without min/max)',
    propDef: { type: Array, secondaryType: TestClass } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: TestClass[]) {
      t.true(value.length >= Model.defaults.minArrayLength, `Expected: >=${Model.defaults.minArrayLength}, actual: ${value.length}`);
      t.true(value.length <= Model.defaults.maxArrayLength, `Expected: <=${Model.defaults.maxArrayLength}, actual: ${value.length}`);
      value.forEach(item => validateTestClass(t, item));
    }
  }
].forEach(({ name, propDef, times, validate }: any) => {

  if (!validate) {
    test.todo(`Activator can instantiate properties with ${name}`);
    return;
  }

  test(`Activator can instantiate properties of ${name}`, t => {
    times = times || 1000;
    const activator = new Activator();
    activator.types[TestClass.name] = TestClass;
    for (let i = 0; i < times; i++) {
      let result = activator['_createProp'](propDef, null);
      validate(t, result);
    }
  });
});

test.todo(`Activator#create returns exact count`);

test.todo(`Activator#create returns crossed result`);

test.todo(`Activator#create accepts override of constants`);

test.todo(`Activator#data returns the generated instances`);

test.todo(`Activator#types returns the known types`);

test.todo(`Activator#clear empties the caches`);


function getDecimalCount(num: number) {
  if (Math.floor(num) === num) return 0;
  return num.toString().split('.')[1].length || 0;
}