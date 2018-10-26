import { test } from 'ava';

import { ModelBuilder, StaticCreate } from './model-builder';
import { getModelDef } from '../utils/meta-reader';
import { Constructor } from '../models/types';

test(`Model#name returns the ModelDefinition name`, t => {
  const expectedName = 'TestModelIdentifier';
  let m = newModel(expectedName);

  t.is(m.name, expectedName);
});

test(`Model#name updates the ModelDefinition name`, t => {
  const expectedName = 'TestModelIdentifier';
  const wrongName = 'WrongPropertyName';
  
  let m = newModel(wrongName);
  t.is(m.name, wrongName);
  m.name = expectedName;
  t.is(m.name, expectedName);
});

test(`Model#prop creates a new Property`, t => {
  const expectedPropName = 'propName';
  let expectedPropType = Date;
  const m = newModel('TestModel').prop(expectedPropName, x => x.type(expectedPropType)).build();

  const modelDef = getModelDef(m);

  t.is(modelDef.props[expectedPropName].type, expectedPropType);
});

test(`Model#prop mergers existing Properties`, t => {
  const expectedPropName = 'propName';
  const expectedPropType = Date;
  const expectedOptRate = 0.89;
  const m = newModel('TestModel')
    .prop(expectedPropName, x => x.type(expectedPropType))
    .prop(expectedPropName, x => x.optional(expectedOptRate))
    .build();
  
  const modelDef = getModelDef(m);

  t.is(modelDef.props[expectedPropName].type, expectedPropType);
  t.is(modelDef.props[expectedPropName].optional, expectedOptRate);
});

test(`Model#key creates a Property marked as a key`, t => {
  const expectedPropName = 'propName';
  const m = newModel('TestModel').key(expectedPropName, x => x).build();

  const modelDef = getModelDef(m);

  t.true(modelDef.props[expectedPropName].key);
});

test(`Model#key updates the primary key`, t => {
  const expectedPropName = 'propName';
  const m = newModel('TestModel').key(expectedPropName, x => x).build();

  const modelDef = getModelDef(m);

  t.is(modelDef.primaryKey, expectedPropName);
});

test(`Model#key can only be called once`, t => {
  const modelBuilder = newModel('TestModel').key('propName', x => x).key('otherPropName', x => x);

  t.throws(() => modelBuilder.build());
});

test(`Model#ref creates a Property marked as a reference`, t => {
  const expectedPropName = 'propName';
  const expectedForeignKey = 'specialId';
  const expectedRefType = newModel('ForeignModel').key(expectedForeignKey, id => id.guid()).build();
  const m = newModel('TestModel').ref(expectedPropName, expectedRefType).build();

  const modelDef = getModelDef(m);

  t.is(modelDef.props[expectedPropName].ref, expectedRefType);
  t.is(modelDef.props[expectedPropName].foreignKey, expectedForeignKey);
});

test(`Model#inherit links models`, t => {
  const Animal = newModel('Animal').build();
  const Eagle = newModel('Eagle').inherits(Animal).build();
  
  const eagleDef = getModelDef(Eagle);
  t.is(eagleDef.inherits, Animal);
});

test(`Model#getter adds a getter function`, t => {
  const expectedGetterName = 'name';
  const expcetedGetterResult = 'Baldy';
  const expectedGetterFunc = function getName() { return expcetedGetterResult; };
  const Eagle = newModel('Eagle').getter(expectedGetterName, expectedGetterFunc).build();
  
  const eagleDef = getModelDef(Eagle);
  t.is(eagleDef.nativeDefinitions[expectedGetterName].get, expectedGetterFunc);

  const eagle = new Eagle();
  t.is(eagle.name, expcetedGetterResult);
});

test(`Model#setter adds a setter function`, t => {
  const expectedSetterName = 'name';
  const expectedPrivateProp = '_name';
  const expectedSetterResult = 'Baldy';
  const expectedSetterFunc = function getName(value:string) { return this[expectedPrivateProp] = value; };
  const Eagle = newModel('Eagle').setter(expectedSetterName, expectedSetterFunc).build();
  
  const eagleDef = getModelDef(Eagle);
  t.is(eagleDef.nativeDefinitions[expectedSetterName].set, expectedSetterFunc);
  const eagle = new Eagle();
  t.is(typeof eagle[expectedPrivateProp], 'undefined');
  eagle.name = expectedSetterResult;
  t.is(eagle[expectedPrivateProp], expectedSetterResult);
});

test(`Model#func adds a custom method`, t => {
  const expectedId = 'TestModel';
  const expectedMethodName = 'testMethod';
  const expectedMethodResult = 'test 1 2 3';
  const expectedMethodFn = function () { return this.value };
  const testModelBuilder = newModel(expectedId).func(expectedMethodName, expectedMethodFn);

  const TestModel = testModelBuilder.build();
  const testModelDef = getModelDef(TestModel);
  const testModelInstance = new TestModel();
  testModelInstance.value = expectedMethodResult;

  t.is(testModelDef.nativeDefinitions[expectedMethodName].value, expectedMethodFn);
  t.is(testModelInstance[expectedMethodName](), expectedMethodResult);
});

test(`Model#toString adds custom toString method`, t => {
  const expectedId = 'TestModel';
  const expectedToStringResult = 'test 1 2 3';
  const expectedToStringFn = function () { return expectedToStringResult };
  const testModelBuilder = newModel(expectedId).toString(expectedToStringFn);

  const expectedModelBuilderToString = `ModelBuilder<${expectedId}>`;
  t.is(testModelBuilder.toString(), expectedModelBuilderToString);

  const TestModel = testModelBuilder.build();
  const testModelInstance = new TestModel();

  t.is(testModelInstance.toString(), expectedToStringResult);
});

test(`Model#build properly inherits properties from parent`, t => {
  const dietKey = 'Diet';  
  const dietChoices = ['herbivore', 'carnivore', 'omnivore'];

  const lifespanKey = 'Lifespan';
  const lifespanMin = 20;
  const lifespanMax = 30;

  const Animal = newModel('Animal')
    .prop(dietKey, x => x.pick(dietChoices))
    .prop(lifespanKey, x => x.integer(0, 200).optional())
    .build();

  const Eagle = newModel('Eagle').inherits(Animal)
    .prop(lifespanKey, x => x.integer(lifespanMin, lifespanMax))
    .build();

  const eagleDef = getModelDef(Eagle);
  t.is(eagleDef.inherits, Animal);
  t.deepEqual(eagleDef.props[dietKey].pick, dietChoices);
  t.is(eagleDef.props[lifespanKey].type, Number);
  t.is(eagleDef.props[lifespanKey].min, lifespanMin);
  t.is(eagleDef.props[lifespanKey].max, lifespanMax);
  t.is(typeof eagleDef.props[lifespanKey].optional, 'undefined');
});

test(`Model#build returns a working class with inheritence`, t => {
  const Animal = newModel('Animal')
    .prop('id', id => id.guid())
    .build();

  const Eagle = newModel('Eagle').inherits(Animal).build();
  const BaldEagle = newModel('BaldEagle').inherits(Eagle).build();
  
  let eagle = new Eagle();
  let baldEagle = new BaldEagle();

  t.true(eagle instanceof Eagle);
  t.true(eagle instanceof Animal);
  t.false(eagle instanceof BaldEagle);

  t.true(baldEagle instanceof Eagle);
  t.true(baldEagle instanceof Animal);
  t.true(baldEagle instanceof BaldEagle);
});

test(`Model#build updates the primaryKey if a property is marked as key`, t => {
  const expectedPrimaryKey = 'latinName';
  const Animal = newModel('Animal')
    .prop(expectedPrimaryKey, id => {
      id['_definition'].key = true;
      return id;
    })
    .build();
  const modelDef = getModelDef(Animal);

  t.is(modelDef.primaryKey, expectedPrimaryKey);
});

test(`StaticCreate creates a new instance with id`, t => {
  const expectedId = 'StaticTest';
  const StaticTest = StaticCreate(expectedId).build();
  const staticTestDef = getModelDef(StaticTest);
  t.is(staticTestDef.name, expectedId);
})

function newModel(name: string) {
  return new ModelBuilder({ name });
}