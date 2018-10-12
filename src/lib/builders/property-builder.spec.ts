import { test } from 'ava';

import { PropertyBuilder } from './property-builder';

import { PropertyDefinition } from '../models/property-definition';
import { CustomGenerator, GuidType, Constructor } from '../models/types';
import { Model, Prop } from '../..';
import { Type, Collection, Key, Ref, Range, Length, Str, Bool, Optional, Integer, Float, Guid, Enum, Pick, Custom } from '../services/decorators';
import { ModelBuilder } from './model-builder';
import { StoredEnum } from '../models/stored-enum';
import { getModelBuilder } from '../utils/meta-reader';
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
})

test(`PropertyBuilder#type accepts a type as well as secondary type`, t => {
  testBoth(
    p => p.type(null), Type(null),
    propDef => {
      t.is(propDef.type, null);
      t.is(typeof propDef.secondaryType, 'undefined');
    }
  );
  
  testBoth(
    p => p.type(TestClass), Type(TestClass),
    propDef => {
      t.is(propDef.type, TestClass);
      t.is(typeof propDef.secondaryType, 'undefined');
    }
  );
  
  testBoth(
    p => p.type(Array, String), Type(Array, String),
    propDef => {
      t.is(propDef.type, Array);
      t.is(propDef.secondaryType, String);
    }
  );
});

test(`PropertyBuilder#array accepts a type`, t => {

  testBoth(
    p => p.array(String), Collection(String),
    propDef => {
      t.is(propDef.type, Array);
      t.is(propDef.secondaryType, String);
    }
  );
  
  testBoth(
    p => p.array(TestClass), Collection(TestClass),
    propDef => {
      t.is(propDef.type, Array);
      t.is(propDef.secondaryType, TestClass);
    }
  );
});

test(`PropertyBuilder#ref accepts a type and optional foreignKey`, t => {
  t.throws(() => newPropBuilder().ref(TestClass));
  t.throws(() => testDecorator(Ref(TestClass)));

  const expectedExplicitKey = 'name';
  testBoth(
    p => p.ref(TestClass, expectedExplicitKey), Ref(TestClass, expectedExplicitKey),
    propDef => {
      t.is(propDef.ref, TestClass);
      t.is(propDef.foreignKey, expectedExplicitKey);
    }
  );
  
  const expectedInferredKey = 'instanceId';
  const InferedTestClass = new ModelBuilder({ name: 'InferedTestClass' }).key(expectedInferredKey, id => id.guid()).build();

  testBoth(
    p => p.ref(InferedTestClass), Ref(InferedTestClass),
    propDef => {
      t.is(propDef.ref, InferedTestClass);
      t.is(propDef.foreignKey, expectedInferredKey);
    }
  );
});

test(`PropertyBuilder#range marks the min/max for numbers`, t => {
  const expectedMin = 3;
  const expectedMax = 12;
  testBoth(
    p => p.range(expectedMin, expectedMax), Range(expectedMin, expectedMax),
    propDef => {
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
  
  t.throws(() => newPropBuilder().range(expectedMax, expectedMin));
  t.throws(() => testDecorator(Range(expectedMax, expectedMin)));
});

test(`PropertyBuilder#range marks the min/max for dates`, t => {
  const expectedMin = new Date('03/11/1994');
  const expectedMax = new Date('4/16/1999');

  testBoth(
    p => p.range(expectedMin, expectedMax), Range(expectedMin, expectedMax),
    propDef => {
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
  
  t.throws(() => newPropBuilder().range(expectedMax, expectedMin));
  t.throws(() => testDecorator(Range(expectedMax, expectedMin)));
});

test(`PropertyBuilder#length sets an equal min/max`, t => {
  const expectedLength = 7;
  testBoth(
    p => p.length(expectedLength), Length(expectedLength),
    propDef => {
      t.is(propDef.min, expectedLength);
      t.is(propDef.max, expectedLength);
    }
  );
});

test(`PropertyBuilder#str accepts optional length, min/max or Regexp`, t => {
  const expectedPattern = /(hell)o{1,5}/;
  testBoth(
    p => p.str(expectedPattern), Str(expectedPattern),
    propDef => {
      t.is(propDef.type, String);
      t.true(propDef.pattern instanceof RegExp);
    }
  );

  const length = 4;
  testBoth(
    p => p.str(length), Str(length),
    propDef => {
      t.is(propDef.type, String);
      t.is(propDef.min, length);
      t.is(propDef.max, length);
    }
  );

  const min = 7, max = 10;
  testBoth(
    p => p.str(min, max), Str(min, max),
    propDef => {
      t.is(propDef.type, String);
      t.is(propDef.min, min);
      t.is(propDef.max, max);
    }
  );

  testBoth(
    p => p.str(), Str(),
    propDef => {
      t.is(propDef.type, String);
      t.is(typeof propDef.pattern, 'undefined');
    }
  );
});

test(`PropertyBuilder#bool defaults the truth rate to 50/50`, t => {
  const expectedRate = 0.5;
  testBoth(
    p => p.bool(), Bool(),
    propDef => t.is(propDef.truthRate, expectedRate)
  );
});

test(`PropertyBuilder#bool accepts a custom truth rate`, t => {
  const expectedRate = 0.8;
  testBoth(
    p => p.bool(expectedRate), Bool(expectedRate),
    propDef => t.is(propDef.truthRate, expectedRate)
  );
});

test(`PropertyBuilder#optional defaults the occurrance rate to 50/50`, t => {
  const occurranceRate = 0.5;
  testBoth(
    p => p.optional(), Optional(),
    propDef => t.is(propDef.optional, occurranceRate)
  );
});

test(`PropertyBuilder#optional accepts a custom occurrance rate`, t => {
  const occurranceRate = 0.8;
  testBoth(
    p => p.optional(occurranceRate), Optional(occurranceRate),
    propDef => t.is(propDef.optional, occurranceRate)
  );
});

test(`PropertyBuilder#integer accepts min and max values`, t => {
  testBoth(
    p => p.integer(), Integer(),
    propDef => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, 0);
      t.is(propDef.min, Model.defaults.minInteger);
      t.is(propDef.max, Model.defaults.maxInteger);
    }
  );

  const expectedMin = 9;
  const expectedMax = 81;
  testBoth(
    p => p.integer(expectedMin, expectedMax), Integer(expectedMin, expectedMax),
    propDef => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, 0);
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
});

test(`PropertyBuilder#float accepts min and max values`, t => {
  testBoth(
    p => p.float(), Float(),
    propDef => {
      t.is(propDef.type, Number);
      t.is(typeof propDef.decimals, 'undefined');
      t.is(propDef.min, Model.defaults.minFloat);
      t.is(propDef.max, Model.defaults.maxFloat);
    }
  );

  let expectedDecimals = 3;
  testBoth(
    p => p.float(expectedDecimals), Float(expectedDecimals),
    propDef => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, expectedDecimals);
      t.is(propDef.min, Model.defaults.minFloat);
      t.is(propDef.max, Model.defaults.maxFloat);
    }
  );

  let expectedMin = 0.6;
  let expectedMax = 0.9;
  testBoth(
    p => p.float(expectedMin, expectedMax), Float(expectedMin, expectedMax),
    propDef => {
      t.is(propDef.type, Number);
      t.is(typeof propDef.decimals, 'undefined');
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );

  expectedDecimals = 7;
  expectedMin = 0.2;
  expectedMax = 0.4;
  testBoth(
    p => p.float(expectedDecimals, expectedMin, expectedMax), Float(expectedDecimals, expectedMin, expectedMax),
    propDef => {
      t.is(propDef.type, Number);
      t.is(propDef.decimals, expectedDecimals);
      t.is(propDef.min, expectedMin);
      t.is(propDef.max, expectedMax);
    }
  );
});

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

test(`PropertyBuilder#guid marks the type as GuidType`, t => {
  testBoth(
    p => p.guid(), Guid(),
    propDef => {
      t.is(propDef.type, GuidType);
    }
  );
});

test(`PropertyBuilder#enum tracks a StoredEnum`, t => {
  enum LightSwitch { Off, On }
  const expectedStoredEnum = new StoredEnum(LightSwitch);

  testBoth(
    p => p.enum(LightSwitch), Enum(LightSwitch),
    propDef => {
      let lightSwitchStored = propDef.type as StoredEnum;
      t.true(lightSwitchStored instanceof StoredEnum);
      t.deepEqual(lightSwitchStored, expectedStoredEnum);
    }
  );
  
});

test(`PropertyBuilder#pick accepts an array of options`, t => {
  const expectedChoices = ['red', 'green', 'blue'];
  testBoth(
    p => p.pick(expectedChoices), Pick(expectedChoices),
    propDef => {
      t.deepEqual(propDef.pick, expectedChoices);
    }
  );
});

test(`PropertyBuilder#choices accepts a function that returns an array of options`, t => {
  const expectedChoices = () => ['red', 'green', 'blue'];
  testBoth(
    p => p.pick(expectedChoices), Pick(expectedChoices),
    propDef => {
      t.deepEqual(propDef.pick, expectedChoices);
    }
  );
});

test(`PropertyBuilder#custom accepts custom random generators`, t => {
  const expectedCustomRand: CustomGenerator = (c => c.animal());
  testBoth(
    p => p.custom(expectedCustomRand), Custom(expectedCustomRand),
    propDef => {
      t.is(propDef.custom, expectedCustomRand);
    }
  );
});

test(`PropertyBuilder can fluently define properties`, t => {
  const expectedName = 'EmployeeId';
  const expectedType = String;
  const expectedLength = 13;

  const actualDef = PropertyBuilder.build(
    newPropBuilder({ name: expectedName })
      .optional()
      .type(expectedType)
      .length(expectedLength));
  
  t.is(actualDef.name, expectedName);
  t.is(actualDef.type, expectedType);
  t.is(actualDef.min, expectedLength);
  t.is(actualDef.max, expectedLength);
  t.is(typeof actualDef.optional, 'number');
});

function newPropBuilder(initialDef?: PropertyDefinition): PropertyBuilder {
  return new PropertyBuilder(initialDef);
}

function testBoth<T=string>(cb: (pb: PropertyBuilder) => PropertyBuilder, decorate: PropertyDecorator, verify: (propDef: PropertyDefinition, testResult: TestResult<T>) => void): void {
  let results = [testBuilder<T>(cb), testDecorator<T>(decorate)];

  results.forEach((r, i) => verify(r.propDef, r));
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
  const propName = 'testProp';
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