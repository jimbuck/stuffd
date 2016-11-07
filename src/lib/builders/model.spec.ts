import { test } from 'ava';

import { Model } from './model';
import { Dictionary } from '../models/dictionary';
import { ModelDefinition } from '../models/model-definition';

test(`Model#name sets the friendly name`, t => {
  const expectedName = 'TestModel';
  const m = newModel().name(expectedName);

  const modelDef = m.build();

  t.is(modelDef.name, expectedName);
});

test(`Model#prop creates a new Property`, t => {
  const expectedPropName = 'propName';
  let expectedPropType = Date;
  const m = newModel().prop(expectedPropName, x => x.type(expectedPropType));

  const modelDef = m.build();

  t.is(modelDef.properties[expectedPropName].type, expectedPropType);
});

test(`Model#prop mergers existing Properties`, t => {
  const expectedPropName = 'propName';
  const expectedPropType = Date;
  const expectedLength = 10;
  const m = newModel()
    .prop(expectedPropName, x => x.type(expectedPropType))
    .prop(expectedPropName, x => x.length(expectedLength));
  
  const modelDef = m.build();

  t.is(modelDef.properties[expectedPropName].type, expectedPropType);
  t.is(modelDef.properties[expectedPropName].length, expectedLength);
});

test(`Model#key creates a Property marked as a key`, t => {
  const expectedPropName = 'propName';
  const m = newModel().key(expectedPropName, x => x);

  const modelDef = m.build();

  t.true(modelDef.properties[expectedPropName].key);
});

test(`Model#ref creates a Property marked as a reference`, t => {
  const expectedPropName = 'propName';
  const expectedRefType = RegExp;
  const m = newModel().ref(expectedPropName, expectedRefType);

  const modelDef = m.build();

  t.is(modelDef.properties[expectedPropName].ref, expectedRefType);
});

test.todo(`Model#inherit links models from the cache`, null);

function newModel(id?: string) {
  return new Model(new Dictionary<Model>(), { id: id || Math.random().toString(36).substr(2, 5) });
}