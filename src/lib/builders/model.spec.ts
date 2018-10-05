import { test } from 'ava';

import { ModelBuilder } from './model';
import { Dictionary } from '../models/dictionary';
import { ModelDefinition } from '../models/model-definition';

test(`Model#id references the ModelDefinition id`, t => {
  const expectedId = 'TestModelIdentifier';
  const m = newModel(expectedId);

  t.is(m.id, expectedId);
});

test(`Model#name sets the friendly name`, t => {
  const expectedName = 'TestModel';
  const m = newModel('TestModel').name(expectedName);

  const modelDef = build(m);

  t.is(modelDef.name, expectedName);
});

test(`Model#prop creates a new Property`, t => {
  const expectedPropName = 'propName';
  let expectedPropType = Date;
  const m = newModel('TestModel').prop(expectedPropName, x => x.type(expectedPropType));

  const modelDef = build(m);

  t.is(modelDef.props[expectedPropName].type, expectedPropType);
});

test(`Model#prop mergers existing Properties`, t => {
  const expectedPropName = 'propName';
  const expectedPropType = Date;
  const expectedLength = 10;
  const m = newModel('TestModel')
    .prop(expectedPropName, x => x.type(expectedPropType))
    .prop(expectedPropName, x => x.length(expectedLength));
  
  const modelDef = build(m);

  t.is(modelDef.props[expectedPropName].type, expectedPropType);
  t.is(modelDef.props[expectedPropName].length, expectedLength);
});

test(`Model#key creates a Property marked as a key`, t => {
  const expectedPropName = 'propName';
  const m = newModel('TestModel').key(expectedPropName, x => x);

  const modelDef = build(m);

  t.true(modelDef.props[expectedPropName].key);
});

test(`Model#ref creates a Property marked as a reference`, t => {
  const expectedPropName = 'propName';
  const expectedRefType = RegExp;
  const m = newModel('TestModel').ref(expectedPropName, expectedRefType);

  const modelDef = build(m);

  t.is(modelDef.props[expectedPropName].ref, expectedRefType);
});

test(`Model#inherit links models`, t => {
  const Animal = newModel('Animal');
  const Eagle = newModel('Eagle');

  Eagle.inherits(Animal);

  const eagleDef = build(Eagle);
  t.is(eagleDef.inherits, Animal);
});

test(`Model#build properly inherits properties from parent`, t => {
  const Animal = newModel('Animal');
  const Eagle = newModel('Eagle');

  const dietKey = 'Diet';  
  const dietChoices = ['herbivore', 'carnivore', 'omnivore'];

  const lifespanKey = 'Lifespan';
  const lifespanMin = 20;
  const lifespanMax = 30;

  Animal
    .prop(dietKey, x => x.choices(dietChoices))
    .prop(lifespanKey, x => x.integer(0, 200).key());

  Eagle.inherits(Animal)
    .prop(lifespanKey, x => x.integer(lifespanMin, lifespanMax));

  const eagleDef = build(Eagle);
  t.is(eagleDef.inherits, Animal);
  t.is(eagleDef.props[dietKey].choices, dietChoices);
  t.is(eagleDef.props[lifespanKey].type, Number);
  t.is(eagleDef.props[lifespanKey].min, lifespanMin);
  t.is(eagleDef.props[lifespanKey].max, lifespanMax);
  t.falsy(eagleDef.props[lifespanKey].key);
});

function newModel(id: string) {
  return new ModelBuilder({ id });
}

function build(model: ModelBuilder): ModelDefinition {
  return model['_build']();
}