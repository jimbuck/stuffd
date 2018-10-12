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
  const expectedLength = 10;
  const m = newModel('TestModel')
    .prop(expectedPropName, x => x.type(expectedPropType))
    .prop(expectedPropName, x => x.length(expectedLength))
    .build();
  
  const modelDef = getModelDef(m);

  t.is(modelDef.props[expectedPropName].type, expectedPropType);
  t.is(modelDef.props[expectedPropName].min, expectedLength);
  t.is(modelDef.props[expectedPropName].max, expectedLength);
});

test(`Model#key creates a Property marked as a key`, t => {
  const expectedPropName = 'propName';
  const m = newModel('TestModel').key(expectedPropName, x => x).build();

  const modelDef = getModelDef(m);

  t.true(modelDef.props[expectedPropName].key);
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

test(`Model#child creates a nested type`, t => {
  const expectedPropName = 'ship';
  const expectedChildTypeName = 'StarFighter';
  const expectedSquadChoices = ['red', 'blue', 'yellow', 'green'];
  let Pilot = newModel('Pilot')
    .child(expectedPropName, expectedChildTypeName, s => s
      .prop('name', n => n.str(/[A-Z] Wing [IIVVXCD]{1,2}/))
      .prop('squadron', s => s.choices(expectedSquadChoices))
    )
    .build();
  
  const pilotDef = getModelDef(Pilot);
  const ChildType = pilotDef.props[expectedPropName].type as Constructor;
  t.is(ChildType.name, expectedChildTypeName);
  const childDef = getModelDef(ChildType);
  t.true(childDef.props['name'].pattern instanceof RegExp);
  t.deepEqual(childDef.props['squadron'].choices, expectedSquadChoices);
  let child = new ChildType();
  t.true(child instanceof ChildType);
});

test(`Model#toString adds custom toString method`, t => {
  const expectedId = 'TestModel';
  const expectedToStringResult = 'test 1 2 3';
  const expectedToStringFn = (x: any) => expectedToStringResult;
  const testModelBuilder = newModel(expectedId).toString(expectedToStringFn);

  const expectedModelBuilderToString = `ModelBuilder<${expectedId}>`;
  t.is(testModelBuilder.toString(), expectedModelBuilderToString);

  const TestModel = testModelBuilder.build();
  const testModelDef = getModelDef(TestModel);
  const testModelInstance = new TestModel();

  t.is(testModelDef.toStringFn, expectedToStringFn);
  t.is(testModelInstance.toString(), expectedToStringResult);
});

test(`Model#build properly inherits properties from parent`, t => {
  const dietKey = 'Diet';  
  const dietChoices = ['herbivore', 'carnivore', 'omnivore'];

  const lifespanKey = 'Lifespan';
  const lifespanMin = 20;
  const lifespanMax = 30;

  const Animal = newModel('Animal')
    .prop(dietKey, x => x.choices(dietChoices))
    .prop(lifespanKey, x => x.integer(0, 200).key())
    .build();

  const Eagle = newModel('Eagle').inherits(Animal)
    .prop(lifespanKey, x => x.integer(lifespanMin, lifespanMax))
    .build();

  const eagleDef = getModelDef(Eagle);
  t.is(eagleDef.inherits, Animal);
  t.deepEqual(eagleDef.props[dietKey].choices, dietChoices);
  t.is(eagleDef.props[lifespanKey].type, Number);
  t.is(eagleDef.props[lifespanKey].min, lifespanMin);
  t.is(eagleDef.props[lifespanKey].max, lifespanMax);
  t.falsy(eagleDef.props[lifespanKey].key);
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

test(`StaticCreate creates a new instance with id`, t => {
  const expectedId = 'StaticTest';
  const StaticTest = StaticCreate(expectedId).build();
  const staticTestDef = getModelDef(StaticTest);
  t.is(staticTestDef.name, expectedId);
})

function newModel(name: string) {
  return new ModelBuilder({ name });
}