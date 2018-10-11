import { test } from 'ava';

import { getDesignType, setModelDef, getModelDef, getModelId, getPrimaryKey } from './meta-reader';
import { ModelDefinition } from '../models/model-definition';

test(`getDesignType gets the TypeScript design type`, t => {
  t.plan(3);
  function Expect(type: any) {
    return function(target: any, propertyKey: string) {  
      t.is(getDesignType(target, propertyKey), type);
    }
  }

  class ChildClass { }
  class ParentClass {
    @Expect(String) name: string;
    @Expect(Number) count: number;
    @Expect(ChildClass) child: ChildClass;
  };
});

test(`getModelDef/setModelDef updates the model defintion on the target`, t => {
  class TargetClass{}

  let expectedModelDef: ModelDefinition = { id: 'TargetClass' };
  setModelDef(TargetClass, expectedModelDef);
  let actualModelDef = getModelDef(TargetClass);
  t.is(actualModelDef, expectedModelDef);
});

test(`getModelId returns the id if it exists`, t => {
  const expectedId = 'TestClass';
  class TestClass{ }

  t.throws(() => getModelId(TestClass));

  let expectedModelDef: ModelDefinition = { id: expectedId };
  setModelDef(TestClass, expectedModelDef);
  let actualModelId = getModelId(TestClass);
  t.is(actualModelId, expectedId);
});

test(`getPrimaryKey returns the primary key if it exists`, t => {
  const expectedId = 'TestClass';
  const expectedPrimaryKey = 'identifier';
  class TestClass{ }

  // No model definition...
  let actualPrimaryKey = getPrimaryKey(TestClass);
  t.is(typeof actualPrimaryKey, 'undefined');

  // Model definition without primary key...
  let expectedModelDef: ModelDefinition = { id: expectedId };
  setModelDef(TestClass, expectedModelDef);
  actualPrimaryKey = getPrimaryKey(TestClass);
  t.is(typeof actualPrimaryKey, 'undefined');

  // Model defintion with primary key...
  expectedModelDef.primaryKey = expectedPrimaryKey;
  setModelDef(TestClass, expectedModelDef);
  actualPrimaryKey = getPrimaryKey(TestClass);
  t.is(actualPrimaryKey, expectedPrimaryKey);
});