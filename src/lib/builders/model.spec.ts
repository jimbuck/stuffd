import { test } from 'ava';

import { Model } from './model';
import { ModelCache } from '../models/model-cache';
import { ModelDefinition } from '../models/model-definition';

test(`Model#id references the ModelDefinition id`, t => {
  const expectedId = 'TestModelIdentifier';
  const m = newModel(expectedId);

  t.is(m.id, expectedId);
});

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

test(`Model#inherit fails for models missing from the cache`, t => {
  const modelCacheA = new ModelCache();
  const modelCacheB = new ModelCache();
  const Animal = modelCacheA.add({ id: 'Animal' });
  const Eagle = modelCacheB.add({ id: 'Eagle' });

  t.throws(() => Eagle.inherits(Animal)); // Different cache (context)
});

test(`Model#inherit fails for invalid model identifiers`, t => {
  const modelCache = new ModelCache();
  const Animal = modelCache.add({ id: 'Animal' });
  const Eagle = modelCache.add({ id: 'Eagle' });

  t.throws(() => Eagle.inherits('Aminal')); // Spelled wrong!
});

test(`Model#inherit links models from the cache`, t => {
  const modelCache = new ModelCache();
  const Animal = modelCache.add({ id: 'Animal' });
  const Eagle = modelCache.add({ id: 'Eagle' });

  Eagle.inherits(Animal);

  const eagleDef = Eagle.build();
  t.is(eagleDef.inherits, Animal);
});

test(`Model#build properly inherits properties from parent`, t => {
  const modelCache = new ModelCache();
  const Animal = modelCache.add({ id: 'Animal' });
  const Eagle = modelCache.add({ id: 'Eagle' });

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

  const eagleDef = Eagle.build();
  t.is(eagleDef.inherits, Animal);
  t.is(eagleDef.properties[dietKey].choices, dietChoices);
  t.is(eagleDef.properties[lifespanKey].type, Number);
  t.is(eagleDef.properties[lifespanKey].min, lifespanMin);
  t.is(eagleDef.properties[lifespanKey].max, lifespanMax);
  t.falsy(eagleDef.properties[lifespanKey].key);
});

function newModel(id?: string) {
  return new Model(new ModelCache(), { id: id || Math.random().toString(36).substr(2, 5) });
}