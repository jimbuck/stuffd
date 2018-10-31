import { test, Context, GenericTestContext } from 'ava';

import { PropertyBuilder } from './property-builder';

import { PropertyDefinition } from '../models/property-definition';
import { CustomGenerator, GuidType, Constructor } from '../models/types';
import { Stuffd, Prop } from '../..';
import { Type, List, Key, Ref, Range, Str, Bool, Optional, Integer, Float, Guid, Enum, Pick, Custom } from '../services/decorators';
import { ModelBuilder } from './model-builder';
import { StoredEnum } from '../models/stored-enum';
import { getModelBuilder, getModelDef } from '../utils/meta-reader';
import { ModelDefinition } from '../models/model-definition';

class TestClass {
  name: string;
  count: number;
}

test(`PropertyBuilder constructor allows an optional initial definition`, t => {
  t.notThrows(() => newPropBuilder());

  const expectedDef: PropertyDefinition = {
    name: 'EmployeeId',
    min: 13,
    max: 13,
    type: String
  };

  const actualDef = newPropBuilder(expectedDef)['_definition'];
  t.deepEqual(actualDef, expectedDef);
});

test(`PropertyBuilder.build retuns a copy of the internal property definition`, t => {
  const expectedDef: PropertyDefinition = {
    name: 'EmployeeId',
    min: 13,
    max: 13,
    type: String
  };

  const actualDef = PropertyBuilder.build(new PropertyBuilder(expectedDef));
  t.deepEqual(actualDef, expectedDef);
  t.not(actualDef, expectedDef);
});

test(`@Key() marks a property as a key`, t => {
  const { propDef } = testDecorator(Key());

  t.true(propDef.key);
});

testBoth('Type', 'accepts a primary type',
  p => p.type(TestClass), Type(TestClass),
  (t, propDef) => {
    t.is(propDef.type, TestClass);
    t.is(typeof propDef.secondaryType, 'undefined');
  }
);

testBoth('Type', 'accepts a primary type as well as secondary type',
  p => p.type(Array, String), Type(Array, String),
  (t, propDef) => {
    t.is(propDef.type, Array);
    t.is(propDef.secondaryType, String);
  }
);

{
  const expectedChildTypeName = 'StarFighter';
  const expectedSquadChoices = ['red', 'blue', 'yellow', 'green'];

  const StarFighter = Stuffd.create(expectedChildTypeName)
    .prop('name', n => n.str(/[A-Z] Wing [IIVVXCD]{1,2}/))
    .prop('squadron', s => s.pick(expectedSquadChoices))
    .build();
  
  testBoth('Type', 'accepts generated classes',
    p => p.type(StarFighter), Type(StarFighter),
    (t, propDef) => {
      t.is(propDef.type, StarFighter);
      const ChildType = propDef.type as Constructor;
      t.is(ChildType.name, expectedChildTypeName);
      const childDef = getModelDef(ChildType);
      t.true(childDef.props['name'].pattern instanceof RegExp);
      t.deepEqual(childDef.props['squadron'].pick, expectedSquadChoices);
      let child = new ChildType();
      t.true(child instanceof ChildType);
    }
  );
}

testBoth('List', 'accepts simple types',
  p => p.list(String), List(String),
  (t, propDef) => {
    t.is(propDef.type, Array);
    t.is(propDef.secondaryType, String);
  }
);

testBoth('List', 'accepts complex types',
  p => p.list(TestClass), List(TestClass),
  (t, propDef) => {
    t.is(propDef.type, Array);
    t.is(propDef.secondaryType, TestClass);
  }
);

{
  const expectedLength = 7;
  testBoth('List', 'accepts length',
    p => p.list(TestClass, expectedLength), List(TestClass, expectedLength),
    (t, propDef) => {
      t.is(propDef.type, Array);
      t.is(propDef.secondaryType, TestClass);
      t.is(propDef.min, expectedLength);
      t.is(propDef.max, expectedLength);
    }
  );
}

{
  const expectedMinLength = 7;
  const expectedMaxLength = 7;
  testBoth('List', 'accepts min/max length',
    p => p.list(TestClass, expectedMinLength, expectedMaxLength), List(TestClass, expectedMinLength, expectedMaxLength),
    (t, propDef) => {
      t.is(propDef.type, Array);
      t.is(propDef.secondaryType, TestClass);
      t.is(propDef.min, expectedMinLength);
      t.is(propDef.max, expectedMaxLength);
    }
  );
}

test(`PropertyBuilder#ref requires a known type or explicit foreignKey`, t => {
  t.throws(() => newPropBuilder().ref(TestClass));
  t.notThrows(() => newPropBuilder().ref(TestClass, 'name'));
});

test(`@Ref() requires a known type or explicit foreignKey`, t => {
  t.throws(() => testDecorator(Ref(TestClass)));
  t.notThrows(() => testDecorator(Ref(TestClass, 'name')));
});

{
  const expectedExplicitKey = 'name';
  testBoth('Ref', 'updates ref and explicit foreign key',
    p => p.ref(TestClass, expectedExplicitKey), Ref(TestClass, expectedExplicitKey),
    (t, propDef) => {
      t.is(propDef.ref, TestClass);
      t.is(propDef.foreignKey, expectedExplicitKey);
    }
  );
}

{
  const expectedInferredKey = 'instanceId';
  const InferedTestClass = new ModelBuilder({ name: 'InferedTestClass' }).key(expectedInferredKey, id => id.guid()).build();

  testBoth('Ref', 'updates ref and implicit foreign key',
    p => p.ref(InferedTestClass), Ref(InferedTestClass),
    (t, propDef) => {
      t.is(propDef.ref, InferedTestClass);
      t.is(propDef.foreignKey, expectedInferredKey);
    }
  );
}

{
  const expectedMinDate = new Date('03/11/1994');
  const expectedMaxDate = new Date('4/16/1999');

  test(`@Range() requires min to be less than or equal to max`, t => {
    t.throws(() => testDecorator(Range(expectedMaxDate, expectedMinDate)));
    t.notThrows(() => testDecorator(Range(expectedMaxDate, expectedMaxDate)));
    t.notThrows(() => testDecorator(Range(expectedMinDate, expectedMaxDate)));
  });

  testBoth('Range', 'acts the same as PropertyBuilder#date',
    p => p.date(expectedMinDate, expectedMaxDate), Range(expectedMinDate, expectedMaxDate),
    (t, propDef) => {
      t.is(propDef.min, expectedMinDate);
      t.is(propDef.max, expectedMaxDate);
    }
  );
}

{
  const expectedPattern = /(hell)o{1,5}/;
  testBoth('Str', 'accepts regex pattern',
    p => p.str(expectedPattern), Str(expectedPattern),
    (t, propDef) => {
      t.is(propDef.type, String);
      t.true(propDef.pattern instanceof RegExp);
    }
  );
}

{
  const length = 4;
  testBoth('Str', 'accepts exact length',
    p => p.str(length), Str(length),
    (t, propDef) => {
      t.is(propDef.type, String);
      t.is(propDef.min, length);
      t.is(propDef.max, length);
    }
  );
}

{
  const min = 7, max = 10;
  testBoth('Str', 'accepts min/max length range',
    p => p.str(min, max), Str(min, max),
    (t, propDef) => {
      t.is(propDef.type, String);
      t.is(propDef.min, min);
      t.is(propDef.max, max);
    }
  );
}

{
  testBoth('Str', 'accepts zero parameters',
    p => p.str(), Str(),
    (t, propDef) => {
      t.is(propDef.type, String);
      t.is(typeof propDef.pattern, 'undefined');
      t.is(typeof propDef.min, 'undefined');
      t.is(typeof propDef.max, 'undefined');
    }
  );
}

{
  const expectedRate = 0.5;
  testBoth('Bool', 'defaults the truth rate to 50/50',
    p => p.bool(), Bool(),
    (t, propDef) => t.is(propDef.truthRate, expectedRate)
  );
}

{
  const expectedRate = 0.8;
  testBoth('Bool', 'accepts a custom truth rate',
    p => p.bool(expectedRate), Bool(expectedRate),
    (t, propDef) => t.is(propDef.truthRate, expectedRate)
  );
}

{
  const occurranceRate = 0.5;
  testBoth('Optional', 'defaults the occurrance rate to 50/50',
    p => p.optional(), Optional(),
    (t, propDef) => t.is(propDef.optional, occurranceRate)
  );
}

{
  const occurranceRate = 0.8;
  testBoth('Optional', 'accepts a custom occurrance rate',
    p => p.optional(occurranceRate), Optional(occurranceRate),
    (t, propDef) => t.is(propDef.optional, occurranceRate)
  );
}

{
  testBoth('Integer', 'defaults to default min/max integer values',
    p => p.integer(), Integer(),
    (t, propDef) => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, 0);
      t.is(propDef.min, Stuffd.defaults.minInteger);
      t.is(propDef.max, Stuffd.defaults.maxInteger);
    }
  );
}

{
  const expectedMin = 9;
  const expectedMax = 81;
  testBoth('Integer', 'accepts min/max range',
    p => p.integer(expectedMin, expectedMax), Integer(expectedMin, expectedMax),
    (t, propDef) => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, 0);
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
}

{
  testBoth('Float', 'defaults to default min/max float values',
    p => p.float(), Float(),
    (t, propDef) => {
      t.is(propDef.type, Number);
      t.is(typeof propDef.decimals, 'undefined');
      t.is(propDef.min, Stuffd.defaults.minFloat);
      t.is(propDef.max, Stuffd.defaults.maxFloat);
    }
  );
}

{
  const expectedDecimals = 3;
  testBoth('Float', 'accepts exact decimals count',
    p => p.float(expectedDecimals), Float(expectedDecimals),
    (t, propDef) => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, expectedDecimals);
      t.is(propDef.min, Stuffd.defaults.minFloat);
      t.is(propDef.max, Stuffd.defaults.maxFloat);
    }
  );
}

{
  const expectedMin = 0.6;
  const expectedMax = 0.9;
  testBoth('Float', 'accepts min/max range',
    p => p.float(expectedMin, expectedMax), Float(expectedMin, expectedMax),
    (t, propDef) => {
      t.is(propDef.type, Number);
      t.is(typeof propDef.decimals, 'undefined');
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
}

{
  const expectedDecimals = 7;
  const expectedMin = 0.2;
  const expectedMax = 0.4;
  testBoth('Float', 'accepts decimals and min/max range',
    p => p.float(expectedDecimals, expectedMin, expectedMax), Float(expectedDecimals, expectedMin, expectedMax),
    (t, propDef) => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, expectedDecimals);
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
}

test(`PropertyBuilder#date generates random date`, t => {
  const { propDef } = testBuilder(p => p.date());
  t.is(propDef.type, Date);
});

test(`PropertyBuilder#date accepts an optional min/max range`, t => {
  const minDate = new Date('01/02/2003')
  const maxDate = new Date('04/05/2006');
  const { propDef } = testBuilder(p => p.date(minDate, maxDate));
  t.is(propDef.type, Date);
  t.is(propDef.min, minDate);
  t.is(propDef.max, maxDate);
});

test(`@Prop() respected the Date type`, t => {
  class CustomDateTestClass {
    @Prop()
    dateProp: Date;
  }

  const modelDef = getModelBuilder(CustomDateTestClass)['_modelDefinition'];
  const propDef = modelDef.props.dateProp;

  t.is(propDef.type, Date);
  t.is(propDef.designType, Date);
});

testBoth('Guid', 'marks the type as GuidType',
  p => p.guid(), Guid(),
  (t, propDef) => {
    t.is(propDef.type, GuidType);
  }
);

{
  enum LightSwitch { Off, On }
  const expectedStoredEnum = new StoredEnum(LightSwitch);

  testBoth('Enum', 'tracks a StoredEnum',
    p => p.enum(LightSwitch), Enum(LightSwitch),
    (t, propDef) => {
      let lightSwitchStored = propDef.type as StoredEnum;
      t.true(lightSwitchStored instanceof StoredEnum);
      t.deepEqual(lightSwitchStored, expectedStoredEnum);
    }
  );
}

{
  const expectedChoices = ['red', 'green', 'blue'];
  testBoth('Pick', 'accepts an array of options',
    p => p.pick(expectedChoices), Pick(expectedChoices),
    (t, propDef) => {
      t.deepEqual(propDef.pick, expectedChoices);
    }
  );
}

{
  const expectedChoices = () => ['red', 'green', 'blue'];
  testBoth('Pick', 'accepts a function that returns an array of options',
    p => p.pick(expectedChoices), Pick(expectedChoices),
    (t, propDef) => {
      t.deepEqual(propDef.pick, expectedChoices);
    }
  );
}

{
  const expectedCustomRand: CustomGenerator = (c => c.animal());
  testBoth('Custom', 'accepts custom random generators',
    p => p.custom(expectedCustomRand), Custom(expectedCustomRand),
    (t, propDef) => {
      t.is(propDef.custom, expectedCustomRand);
    }
  );
}

test(`PropertyBuilder can fluently define properties`, t => {
  const expectedName = 'EmployeeId';
  const expectedType = String;
  const expectedLength = 13;

  const actualDef = PropertyBuilder.build(
    newPropBuilder({ name: expectedName })
      .optional()
      .type(expectedType)
      .str(expectedLength));
  
  t.is(actualDef.name, expectedName);
  t.is(actualDef.type, expectedType);
  t.is(actualDef.min, expectedLength);
  t.is(actualDef.max, expectedLength);
  t.is(typeof actualDef.optional, 'number');
});

function newPropBuilder(initialDef?: PropertyDefinition): PropertyBuilder {
  return new PropertyBuilder(initialDef);
}

function testBoth<T=string>(name:string, subject: string, cb: (pb: PropertyBuilder) => PropertyBuilder, decorate: PropertyDecorator, verify: (t: GenericTestContext<Context<any>>, propDef: PropertyDefinition, testResult: TestResult<T>) => void): void {
  
  test(`PropertyBuilder#${name.toLowerCase()} ${subject}`, t => {
    const results = testBuilder<T>(cb);
    verify(t, results.propDef, results);
  });

  test(`@${name}() ${subject}`, t => {
    const results = testDecorator<T>(decorate);
    verify(t, results.propDef, results);
  });
}

interface TestResult<T> {
  GeneratedClass: Constructor<GeneratedTestClass<T>>;
  model: GeneratedTestClass<T>;
  modelDef: ModelDefinition;
  propDef: PropertyDefinition;
}

function testBuilder<T>(cb: (pb: PropertyBuilder) => PropertyBuilder): TestResult<T> {
  const propName = 'testProp';
  const { GeneratedClass, model } = createNewClass<T>();
  const modelDef = getModelBuilder(GeneratedClass)['_modelDefinition'];

  let propBuilder = cb(new PropertyBuilder({ name: propName }));
  const propDef = PropertyBuilder.build(propBuilder);

  return { GeneratedClass, model, modelDef, propDef };
}

function testDecorator<T=string>(decorate: PropertyDecorator): TestResult<T> {
  const propName = 'prop';
  const { GeneratedClass, model } = createNewClass<T>();

  decorate(model, propName);

  const modelDef = getModelBuilder(GeneratedClass)['_modelDefinition'];
  const propDef = modelDef.props[propName];

  return {
    GeneratedClass, model, modelDef, propDef
  };
}

interface GeneratedTestClass<T> {
  prop: T;
}

function createNewClass<T>() {
  const GeneratedClass = (new Function(`"use strict";return (function GenerateClass(){})`)()) as Constructor<GeneratedTestClass<T>>;
  const model = new GeneratedClass();

  return { GeneratedClass, model };
}