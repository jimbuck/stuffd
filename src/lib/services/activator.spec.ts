import { test, GenericTestContext, Context } from 'ava';
import { Activator } from './activator';
import { PropertyDefinition } from '../models/property-definition';
import { setModelDef } from '../utils/meta-reader';
import { Stuffd } from '../..';
import { GuidType, Constructor } from '../models/types';
import { StoredEnum } from '../models/stored-enum';
import { crossProps } from '../utils/extensions';
import { ListBucket } from '../models/list-bucket';
import { ModelDefinition } from '../models/model-definition';

const sillyNameRegex = new RegExp(/[JKTSMP][aeiou][mnpd]/);
class TestClass {
  id: string;
  name: string;
  factor: number;
}

test.before(() => {
  setModelDef(TestClass, {
    name: 'TestClass',
    primaryKey: 'id',
    props: {
      'id': { key: true, type: GuidType, designType: String },
      'name': { type: String, designType: String, pattern: sillyNameRegex },
      'factor': { designType: Number, type: Number, decimals: 0, min: 0, max: 100 }
    }
  });
});

class NonDefinedClass {
  id: string;
  finished: boolean;
}

enum LightSwitch {
  Off, On
}
const lightSwitchEnum = new StoredEnum(LightSwitch);

function validateTestClass(t: GenericTestContext<Context<any>>, obj: TestClass) {
  t.true(
    (obj.id.length === 36) &&
    (sillyNameRegex.test(obj.name)) &&
    (obj.factor >= 0 || obj.factor <= 100 && Math.floor(obj.factor) === obj.factor), `${JSON.stringify(obj)} is invalid!`);
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

test(`Activator's data keeps a ledger`, t => {
  const activator = new Activator();
  t.true(Array.isArray(activator.data.ledger));
});

test(`Activator exposes random utility instance`, t => {
  const expectedSeed = 123;
  const activator = new Activator(expectedSeed);
  t.is(typeof activator.rand.seed, 'number');
  t.is(activator.rand.seed, expectedSeed);
});

test(`Activator provides property name upon error`, t => {
  const expectedModelName = 'SomeCoolModel';
  const expectedPropName = 'AVeryUniqueAndDescriptivePropertyName';
  const propDef: PropertyDefinition = { name: expectedPropName, designType: String, ref: NonDefinedClass };
  const modelDef: ModelDefinition = { name: expectedModelName, propList: [expectedPropName], props: { [expectedPropName]: propDef } };
  const FakeType: Constructor<any> = function () { } as any;
  setModelDef(FakeType, modelDef);
  const activator = new Activator();
  t.throws(() => activator.create(FakeType, 1), (err: Error) => err.message.includes(expectedPropName) && err.message.includes(expectedModelName))
});

test(`Activator sets keys without explicit types to null`, t => {
  const expectedModelName = 'SomeCoolModel';
  const expectedPropName = 'AVeryUniqueAndDescriptivePropertyName';
  const propDef: PropertyDefinition = { name: expectedPropName, designType: String, key: true };
  const modelDef: ModelDefinition = { name: expectedModelName, propList: [expectedPropName], props: { [expectedPropName]: propDef } };
  const FakeType: Constructor<any> = function () { } as any;
  setModelDef(FakeType, modelDef);
  const activator = new Activator();
  const instance = activator.create(FakeType, 1)[0];
  t.is(instance[expectedPropName], null);
});

[
  {
    name: 'regular expressions',
    propDef: { type: RegExp as any, designType: RegExp } as PropertyDefinition,
    throws: true
  },
  {
    name: 'pick types',
    propDef: { pick: ['red', 'blue', 'green'] } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(['red', 'blue', 'green'].includes(value));
    }
  },
  {
    name: 'pick function',
    propDef: { pick: () => ['red', 'blue', 'green'] } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(['red', 'blue', 'green'].includes(value));
    }
  },
  {
    name: 'custom generators',
    propDef: { custom: (c => c.d20()) } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= 1 && value <= 20);
    }
  },
  {
    name: 'references to generated instances with implicit primary keys',
    propDef: { designType: String, ref: TestClass } as PropertyDefinition,
    setup(activator: Activator, t: GenericTestContext<Context<any>>) {
      let jim = createTestClass('Jim');
      let tom = createTestClass('Tom');
      let pam = createTestClass('Pam');

      activator.data.add(TestClass.name, [jim, tom, pam]);
      t.context.availableKeys = [jim.id, tom.id, pam.id];
    },
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(t.context.availableKeys.includes(value));
    }
  },
  {
    name: 'references to provided instances with implicit primary keys',
    propDef: { name: 'implicitProvidedProp', designType: String, ref: TestClass } as PropertyDefinition,
    setup(activator: Activator, t: GenericTestContext<Context<any>>) {
      let jim = createTestClass('Jim');
      let tom = createTestClass('Tom');
      let pam = createTestClass('Pam');

      t.context.availableKeys = [jim.id, tom.id, pam.id];
      let refs = new ListBucket();
      refs.add('implicitProvidedProp', [jim, tom, pam]);
      t.context.refs = refs;
    },
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(t.context.availableKeys.includes(value));
    }
  },
  {
    name: 'references to other instances with explicit primary keys',
    propDef: { designType: String, ref: TestClass, foreignKey: 'name' } as PropertyDefinition,
    setup(activator: Activator, t: GenericTestContext<Context<any>>) {
      let jim = createTestClass('Jim');
      let tom = createTestClass('Tom');
      let pam = createTestClass('Pam');

      activator.data.add(TestClass.name, [jim, tom, pam]);
      t.context.availableKeys = [jim.name, tom.name, pam.name];
    },
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(t.context.availableKeys.includes(value));
    }
  },
  {
    name: 'references to instances without primary keys',
    propDef: { designType: String, ref: NonDefinedClass } as PropertyDefinition,
    throws: true
  },
  {
    name: 'references to non-existent instances',
    propDef: { designType: String, ref: TestClass, foreignKey: 'name' } as PropertyDefinition,
    setup(activator: Activator, t: GenericTestContext<Context<any>>) {
      let jim = createTestClass();
      let tom = createTestClass();
      let pam = createTestClass();
      t.context.availableKeys = [jim.name, tom.name, pam.name];
    },
    throws: true
  },
  {
    name: 'references to other instances with missing primary keys',
    propDef: { designType: String, ref: TestClass, foreignKey: 'name' } as PropertyDefinition,
    setup(activator: Activator, t: GenericTestContext<Context<any>>) {
      let jim = createTestClass();
      let tom = createTestClass();
      let pam = createTestClass();

      activator.data.add(TestClass.name, [jim, tom, pam]);
      t.context.availableKeys = [jim.name, tom.name, pam.name];
    },
    throws: true
  },
  {
    name: 'enums defaulting to numbers',
    times: 10000,
    propDef: { type: lightSwitchEnum } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      let trueCount = t.context.trueCount || 0;
      let totalCount = t.context.totalCount || 0;
      t.true(value === LightSwitch.Off || value === LightSwitch.On);
      totalCount++;
      if (value === LightSwitch.On) trueCount++;

      t.context.totalCount = totalCount;
      t.context.trueCount = trueCount;

      if (totalCount >= 5000) {
        t.is(Math.round(10 * trueCount / totalCount) / 10, 0.5);
      }
    }
  },
  {
    name: 'enums as numbers',
    times: 10000,
    propDef: { type: lightSwitchEnum, secondaryType: Number } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      let trueCount = t.context.trueCount || 0;
      let totalCount = t.context.totalCount || 0;
      t.true(value === LightSwitch.Off || value === LightSwitch.On);
      totalCount++;
      if (value === LightSwitch.On) trueCount++;

      t.context.totalCount = totalCount;
      t.context.trueCount = trueCount;

      if (totalCount >= 5000) {
        t.is(Math.round(10 * trueCount / totalCount) / 10, 0.5);
      }
    }
  },
  {
    name: 'enums as strings',
    times: 10000,
    propDef: { type: lightSwitchEnum, secondaryType: String } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      let trueCount = t.context.trueCount || 0;
      let totalCount = t.context.totalCount || 0;
      t.true(value === LightSwitch[LightSwitch.Off] || value === LightSwitch[LightSwitch.On]);
      totalCount++;
      if (value === LightSwitch[LightSwitch.On]) trueCount++;

      t.context.totalCount = totalCount;
      t.context.trueCount = trueCount;

      if (totalCount >= 5000) {
        t.is(Math.round(10 * trueCount / totalCount) / 10, 0.5);
      }
    }
  },
  {
    name: 'enums as boolean',
    propDef: { type: lightSwitchEnum, secondaryType: Boolean } as PropertyDefinition,
    throws: true
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
      t.true(value >= Stuffd.defaults.minInteger, `Expected: >=${Stuffd.defaults.minInteger}, actual: ${value}`);
      t.true(value <= Stuffd.defaults.maxInteger, `Expected: <=${Stuffd.defaults.maxInteger}, actual: ${value}`);
      t.is(value, Math.floor(value));
    }
  },
  {
    name: 'integers (with min only)',
    propDef: { type: Number, min: 7 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'integers (with max only)',
    propDef: { type: Number, max: 9 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'floats (with fixed decimals)',
    propDef: { designType: Number, type: Number, decimals: 6 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= Stuffd.defaults.minFloat, `Expected: >=${Stuffd.defaults.minFloat}, actual: ${value}`);
      t.true(value <= Stuffd.defaults.maxFloat, `Expected: <=${Stuffd.defaults.maxFloat}, actual: ${value}`);
      t.true(getDecimalCount(value) <= 6);
    }
  },
  {
    name: 'floats (with min/max)',
    propDef: { designType: Number, type: Number, min: 4, max: 24 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: number) {
      t.true(value >= Stuffd.defaults.minFloat, `Expected: >=${Stuffd.defaults.minFloat}, actual: ${value}`);
      t.true(value <= Stuffd.defaults.maxFloat, `Expected: <=${Stuffd.defaults.maxFloat}, actual: ${value}`);
      t.true(getDecimalCount(value) <= Stuffd.defaults.maxFloatDecimals);
    }
  },
  {
    name: 'floats (with min only)',
    propDef: { type: Number, min: 7.8 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'floats (with max only)',
    propDef: { type: Number, max: 9.7 } as PropertyDefinition,
    throws: true
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
    propDef: { type: Date } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: Date) {
      t.true(value instanceof Date);
      t.true(value >= Stuffd.defaults.minDate, `Expected: >=${Stuffd.defaults.minDate}, actual: ${value}`);
      t.true(value <= Stuffd.defaults.maxDate, `Expected: <=${Stuffd.defaults.maxDate}, actual: ${value}`);
    }
  },
  {
    name: 'dates (with min/max)',
    propDef: { type: Date, min: new Date('01/02/1950'), max: new Date('03/04/2000') } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: Date) {
      t.true(value instanceof Date);
      t.true(value >= new Date('01/02/1950'), `Expected: >='01/02/1950', actual: ${value}`);
      t.true(value <= new Date('03/04/2000'), `Expected: <='03/04/2000', actual: ${value}`);
    }
  },
  {
    name: 'dates (with min only)',
    propDef: { type: Date, min: new Date('01/02/1950') } as PropertyDefinition,
    throws: true
  },
  {
    name: 'dates (with max only)',
    propDef: { type: Date, max: new Date('03/04/2000') } as PropertyDefinition,
    throws: true
  },
  {
    name: 'strings (without min/max)',
    propDef: { type: String } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(value.length >= Stuffd.defaults.minStringLength, `Expected: >= ${Stuffd.defaults.minStringLength}, actual: ${value}`);
      t.true(value.length <= Stuffd.defaults.maxStringLength, `Expected: <= ${Stuffd.defaults.maxStringLength}, actual: ${value}`);
    }
  },
  {
    name: 'strings (with pattern)',
    propDef: { type: String, pattern: sillyNameRegex } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(sillyNameRegex.test(value));
    }
  },
  {
    name: 'strings (with min/max)',
    propDef: { type: String, min: 40, max: 90 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string) {
      t.true(value.length >= 40, `Expected: >=40, actual: ${value}`);
      t.true(value.length <= 90, `Expected: <=90, actual: ${value}`);
    }
  },
  {
    name: 'strings (with min only)',
    propDef: { type: String, min: 40 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'strings (with max only)',
    propDef: { type: String, max: 90 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'number arrays (with min/max)',
    propDef: { type: Array, secondaryType: Number, min: 3000, max: 8000 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: Number[]) {
      t.true(value.length >= 3000, `Expected: >= 3000, actual: ${value.length}`);
      t.true(value.length <= 8000, `Expected: <= 8000, actual: ${value.length}`);
      t.true(value.every(num => num >= Stuffd.defaults.minFloat && num <= Stuffd.defaults.maxFloat));
    }
  },
  {
    name: 'number arrays (without min/max)',
    propDef: { type: Array, secondaryType: Number } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: Number[]) {
      t.true(value.length >= Stuffd.defaults.minArrayLength, `Expected: >= ${Stuffd.defaults.minArrayLength}, actual: ${value.length}`);
      t.true(value.length <= Stuffd.defaults.maxArrayLength, `Expected: <= ${Stuffd.defaults.maxArrayLength}, actual: ${value.length}`);
      t.true(value.every(num => num >= Stuffd.defaults.minFloat && num <= Stuffd.defaults.maxFloat));
    }
  },
  {
    name: 'number arrays (with min only)',
    propDef: { type: Array, secondaryType: Number, min: 3000 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'number arrays (with max only)',
    propDef: { type: Array, secondaryType: Number, max: 8000 } as PropertyDefinition,
    throws: true
  },
  {
    name: 'guid arrays (with min/max)',
    propDef: { type: Array, secondaryType: GuidType, min: 20, max: 70 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string[]) {
      t.true(value.length >= 20, `Expected: >= 20, actual: ${value.length}`);
      t.true(value.length <= 70, `Expected: <= 70, actual: ${value.length}`);
      t.true(value.every(guid => guid.length === 36));
    }
  },
  {
    name: 'guid arrays (without min/max)',
    propDef: { type: Array, secondaryType: GuidType } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string[]) {
      t.true(value.length >= Stuffd.defaults.minArrayLength, `Expected: >= ${Stuffd.defaults.minArrayLength}, actual: ${value.length}`);
      t.true(value.length <= Stuffd.defaults.maxArrayLength, `Expected: <= ${Stuffd.defaults.maxArrayLength}, actual: ${value.length}`);
      t.true(value.every(guid => guid.length === 36));
    }
  },
  {
    name: 'enum arrays (with min/max)',
    propDef: { type: Array, secondaryType: lightSwitchEnum, min: 4000, max: 6000 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: LightSwitch[]) {
      t.true(value.length >= 4000, `Expected: >= 4000, actual: ${value.length}`);
      t.true(value.length <= 6000, `Expected: <= 6000, actual: ${value.length}`);

      let onCount = value.filter(ls => ls === LightSwitch.On).length;
      let offCount = value.filter(ls => ls === LightSwitch.Off).length;
      let onRatio = Math.round(10 * onCount / value.length) / 10;
      let offRatio = Math.round(10 * offCount / value.length) / 10;

      t.is(onRatio, 0.5);
      t.is(offRatio, 0.5);
    }
  },
  {
    name: 'enum arrays (without min/max)',
    propDef: { type: Array, secondaryType: lightSwitchEnum } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: LightSwitch[]) {
      t.true(value.length >= Stuffd.defaults.minArrayLength, `Expected: >= ${Stuffd.defaults.minArrayLength}, actual: ${value.length}`);
      t.true(value.length <= Stuffd.defaults.maxArrayLength, `Expected: <= ${Stuffd.defaults.maxArrayLength}, actual: ${value.length}`);
      t.true(value.every(ls => ls === LightSwitch.Off || ls === LightSwitch.On));
    }
  },
  {
    name: 'string arrays (with min/max)',
    propDef: { type: Array, secondaryType: String, min: 20, max: 70 } as PropertyDefinition,
    validate(t: GenericTestContext<Context<any>>, value: string[]) {
      t.true(value.length >= 20, `Expected: >= 20, actual: ${value.length}`);
      t.true(value.length <= 70, `Expected: <= 70, actual: ${value.length}`);
      t.true(value.every(str => str.length >= Stuffd.defaults.minStringLength && str.length <= Stuffd.defaults.maxStringLength));
    }
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
      t.true(value.length >= Stuffd.defaults.minArrayLength, `Expected: >=${Stuffd.defaults.minArrayLength}, actual: ${value.length}`);
      t.true(value.length <= Stuffd.defaults.maxArrayLength, `Expected: <=${Stuffd.defaults.maxArrayLength}, actual: ${value.length}`);
      value.forEach(item => validateTestClass(t, item));
    }
  },
  {
    name: 'complex objects',
    propDef: { type: TestClass, designType: TestClass } as PropertyDefinition,
    validate: validateTestClass
  }
].forEach(({ name, times, propDef, setup, validate, throws }: any) => {

  if (!throws && !validate) {
    test.todo(`Activator can instantiate properties of ${name}`);
    return;
  }

  const activator = new Activator();
  activator.types[TestClass.name] = TestClass;

  if (throws) {
    test(`Activator#_createProp throws when instantiating properties of ${name}`, t => {
      if (setup) setup(activator, t);
      t.throws(() => activator['_createProp'](propDef, t.context.refs));
    });
  } else {
    test(`Activator#_createProp can instantiate properties of ${name}`, t => {
      times = times || 1000;
      if (setup) setup(activator, t);
      for (let i = 0; i < times; i++) {
        let result = activator['_createProp'](propDef, t.context.refs);
        validate(t, result);
      }
    });
  }
});

test(`Activator#_createModel can skip optional properties`, t => {
  const expectedPresentRatio = 0.8;
  class SpecialClass {
    id: string;
    present: boolean;
  }
  setModelDef(SpecialClass, {
    name: 'SpecialClass',
    primaryKey: 'id',
    props: {
      'id': { key: true, type: GuidType },
      'present': { optional: expectedPresentRatio, designType: Boolean, type: Boolean, pick: [true] }
    }
  });
  const activator = new Activator();
  const total = 10000;
  const results = activator.create(SpecialClass, total);

  const presentCount = results.filter(x => x.present).length;
  const presentRatio = Math.round(10 * presentCount / total) / 10;
  t.is(presentRatio, expectedPresentRatio);
});

test(`Activator#create throws on unknown types`, t => {
  class SomeUnknownClass {
    thing: number;
    stuff: string;
  }
  const activator = new Activator();
  t.throws(() => activator.create(SomeUnknownClass, 4));
});

test(`Activator#create returns exact count`, t => {
  const expectedCount = 8;
  const activator = new Activator();
  const result = activator.create(TestClass, expectedCount);
  t.true(Array.isArray(result));
  t.is(result.length, expectedCount);
  t.true(result.every(x => x instanceof TestClass));
});

test(`Activator#create must be greater than zero`, t => {
  const activator = new Activator();
  t.throws(() => activator.create(TestClass, 0));
});

test(`Activator#create returns crossed result`, t => {
  class CrossedClass {
    id: string;
    child1: string;
    child2: string;
    child3: string;
  }
  setModelDef(CrossedClass, {
    name: 'CrossedClass',
    primaryKey: 'id',
    props: {
      'id': { key: true, type: GuidType },
      'child1': { designType: String, type: String, ref: TestClass },
      'child2': { designType: String, type: String, ref: TestClass },
      'child3': { designType: String, type: String, ref: TestClass }
    }
  });
  const groupACount = 3;
  const groupBCount = 2;
  const groupCCount = 4;

  const activator = new Activator();
  const groupA = activator.create(TestClass, 3);
  const groupB = activator.create(TestClass, 2);
  const groupC = activator.create(TestClass, 4);
  const groupAKeys = groupA.map(a => a.id);
  const groupBKeys = groupB.map(b => b.id);
  const groupCKeys = groupC.map(c => c.id);

  const crossed = crossProps({
    child1: groupAKeys,
    child2: groupBKeys,
    child3: groupCKeys
  });
  const result = activator.create(CrossedClass, crossed);
  t.is(result.length, groupACount * groupBCount * groupCCount);
  t.true(result.every(r => groupAKeys.includes(r.child1)));
  t.true(result.every(r => groupBKeys.includes(r.child2)));
  t.true(result.every(r => groupCKeys.includes(r.child3)));
});

test(`Activator#create accepts override of constants`, t => {
  const expectedCount = 8;
  const expectedFactor = 10;
  const activator = new Activator();
  const result = activator.create(TestClass, expectedCount, { factor: expectedFactor });
  t.true(Array.isArray(result));
  t.is(result.length, expectedCount);
  t.true(result.every(x => x.factor === expectedFactor));
});

test(`Activator#data returns the generated instances`, t => {
  const expectedCount = 10;
  const activator = new Activator();

  activator.create(TestClass, expectedCount);
  const internalData = activator.data.get(TestClass.name);
  t.is(Object.keys(activator.types).length, 1);
  t.is(internalData.length, expectedCount);
  t.true(internalData.every(x => x instanceof TestClass));
});

test(`Activator#types returns the known types`, t => {
  const activator = new Activator();
  activator.create(TestClass, 1);
  t.is(activator.types[TestClass.name], TestClass);
});

test(`Activator#clear empties the types and data`, t => {
  const expectedSeed = -6014;
  const activator = new Activator(expectedSeed);
  t.is(activator.seed, expectedSeed);

  activator.create(TestClass, 1);
  t.is(activator.seed, expectedSeed);
  t.is(activator.data.get(TestClass.name).length, 1);
  t.is(Object.keys(activator.types).length, 1);

  activator.clear();
  t.is(activator.seed, expectedSeed);
  t.is(activator.data.get(TestClass.name).length, 0);
  t.is(Object.keys(activator.types).length, 0);
});

test(`Activator#reset restores the types, data, and randomizer`, t => {
  let expectedSeed = -6014;
  const activator = new Activator(expectedSeed);
  t.is(activator.seed, expectedSeed);

  const [version1] = activator.create(TestClass, 1);
  t.is(activator.seed, expectedSeed);
  t.is(activator.data.get(TestClass.name).length, 1);
  t.is(Object.keys(activator.types).length, 1);

  activator.reset();
  t.is(activator.seed, expectedSeed);
  t.is(activator.data.get(TestClass.name).length, 0);
  t.is(Object.keys(activator.types).length, 0);

  const [version2] = activator.create(TestClass, 1);
  t.is(activator.data.get(TestClass.name).length, 1);
  t.is(Object.keys(activator.types).length, 1);
  t.deepEqual(version2, version1);

  expectedSeed = -2001;
  activator.reset(expectedSeed);
  t.is(activator.seed, expectedSeed);
  t.is(activator.data.get(TestClass.name).length, 0);
  t.is(Object.keys(activator.types).length, 0);

  const [version3] = activator.create(TestClass, 1);
  t.is(activator.data.get(TestClass.name).length, 1);
  t.is(Object.keys(activator.types).length, 1);
  t.notDeepEqual(version3, version1);
});

function getDecimalCount(num: number) {
  if (Math.floor(num) === num) return 0;
  return num.toString().split('.')[1].length || 0;
}

function createTestClass(name?: string) {
  let tc = new TestClass();
  tc.id = `00000000-0000-0000-0000-0000${Math.floor(Math.random() * 99999999)}`;
  tc.name = name;
  tc.factor = Math.floor(Math.random() * 101);
  return tc;
}