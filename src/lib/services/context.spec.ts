import { test } from 'ava';

import { Context } from './context';
import { Constructor, Lookup, GeneratedArray } from '../models/types';
import { Activator } from './activator';
import { StaticCreate } from '../builders/model-builder';

const EMPTY_JSON_OBJECT = '{}';

test(`Optionally accepts a seed`, t => {
  const ctx1 = new Context();
  t.true(ctx1 instanceof Context);
  t.is(typeof ctx1.seed, 'number');

  const EXPECTED_SEED = 123;
  const ctx2 = new Context(EXPECTED_SEED);
  t.true(ctx2 instanceof Context);
  t.is(ctx2.seed, EXPECTED_SEED);
});

test(`Context#using returns a populated CollectionBuilder`, t => {
  const ctx = new Context();
  const expectedCollection = [2, 4, 6];

  const expectedKey = 'test';
  const expectedRefs = { [expectedKey]: expectedCollection };
  const collection = ctx.using(expectedRefs);

  t.deepEqual(collection['_explicitRefs'].get(expectedKey), expectedRefs[expectedKey]);
});

test(`Context#cross returns a populated CollectionBuilder`, t => {
  const ctx = new Context();

  const expectedRefs = { 'evens': [2, 4, 6], 'odds': [1, 3, 5] };
  const collection = ctx.cross(expectedRefs);

  t.deepEqual(collection['_crossRefs'], expectedRefs);
});

// Maches CollectionBuilder#create
test(`Context#create requires count or cross`, t => {
  const Num = StaticCreate('Num').key('id', id => id.pick([1, 2])).build();

  const ctx = createContext();

  t.throws(() => ctx.create(Num, null));
});

// Maches CollectionBuilder#create
test(`Context#create returns exact count for non-crossed`, t => {
  const Num = StaticCreate('Num').key('id', id => id.guid()).build();

  const expectedCount = 7;

  const ctx = createContext((Type, count, constants) => {
    t.is(count, expectedCount);
  });

  ctx.create(Num, expectedCount);
});

// Maches CollectionBuilder#create
test(`Context#create returns result for each cross`, t => {
  const color = ['red', 'white', 'blue'];
  const num = [1, 2];

  const Col = StaticCreate('Col').key('id', c => c.pick(color)).build();
  const Num = StaticCreate('Num').key('id', id => id.pick(num)).build();
  const TestThing = StaticCreate('TestThing')
    .key('id', id => id.guid())
    .ref('color', Col)
    .ref('num', Num)
    .build();

  const expectedRefs = [
    { color: 'red', num: 1 }, { color: 'red', num: 2 },
    { color: 'white', num: 1 }, { color: 'white', num: 2 },
    { color: 'blue', num: 1 }, { color: 'blue', num: 2 }];

  const crosses = {
    color: [new Col({ id: 'red' }), new Col({ id: 'white' }), new Col({ id: 'blue' })],
    num: [new Num({ id: 1 }), new Num({ id: 2 })]
  };
  
  const ctx = createContext((Type, cross, constants) => {
    t.deepEqual(cross, expectedRefs);
  });

  ctx.cross(crosses).create(TestThing);
});

// Maches CollectionBuilder#create
test(`Context#create requires each list to have one or more generated items`, t => {
  const Col = StaticCreate('Col').key('id', c => c.pick(['red', 'white', 'blue'])).build();
  const Num = StaticCreate('Num').key('id', id => id.pick([1, 2])).build();
  const TestThing = StaticCreate('TestThing')
    .key('id', id => id.guid())
    .ref('color', Col)
    .ref('num', Num)
    .build();

  const invalidColor = [{ id: 'red' }, { id: 'white' }, { id: 'blue' }];
  const validColor = [new Col({ id: 'red' }), new Col({ id: 'white' }), new Col({ id: 'blue' })];
  
  const invalidNum = [{ id: 1 }, { id: 2 }];
  const validNum = [new Num({ id: 1 }), new Num({ id: 2 })];
  
  const ctx = createContext();

  t.throws(() => ctx.cross({ color: invalidColor, num: validNum }).create(TestThing));
  t.throws(() => ctx.cross({ color: validColor, num: invalidNum }).create(TestThing));
  t.throws(() => ctx.cross({ color: invalidColor, num: invalidNum }).create(TestThing));
  t.notThrows(() => ctx.cross({ color: validColor, num: validNum }).create(TestThing));
});

// Maches CollectionBuilder#create
test(`Context#create accepts an override of constants`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.guid())
    .prop('name', n => n.str(30))
    .build();

  const expectedConstants = {
    name: 'constant-name'
  };

  const ctx = createContext((Type, count, constants) => {
    t.deepEqual(constants, expectedConstants);
  });

  ctx.create(Num, 3, expectedConstants);
});

test(`Context#json returns a string of the generated data`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.integer(1, 3))
    .prop('name', n => n.str(30))
    .build();
  
  const ctx = createContext();

  const expectedData = {
    Num: [
      new Num({ id: 1, name: 'red' }),
      new Num({ id: 3, name: 'white' }),
        new Num({ id: 2, name: 'blue' })]
  };
  const expectedJson = JSON.stringify(expectedData);

  changeActivatorData(ctx, expectedData);

  const json = ctx.json();
  t.is(json, expectedJson);
});

test(`Context#json accepts a format flag`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.integer(1, 3))
    .prop('name', n => n.str(30))
    .build();
  
  const ctx = createContext();

  const expectedData = {
    Num: [
      new Num({ id: 1, name: 'red' }),
      new Num({ id: 3, name: 'white' }),
        new Num({ id: 2, name: 'blue' })]
  };
  const expectedJson = JSON.stringify(expectedData, null, '\t');

  changeActivatorData(ctx, expectedData);

  const json = ctx.json(true);
  t.is(json, expectedJson);
});

test(`Context#json accepts a format character`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.integer(1, 3))
    .prop('name', n => n.str(30))
    .build();
  
  const formatChar = '   ';
  const ctx = createContext();

  const expectedData = {
    Num: [
      new Num({ id: 1, name: 'red' }),
      new Num({ id: 3, name: 'white' }),
        new Num({ id: 2, name: 'blue' })]
  };
  const expectedJson = JSON.stringify(expectedData, null, formatChar);

  changeActivatorData(ctx, expectedData);

  const json = ctx.json(formatChar);
  t.is(json, expectedJson);
});

test(`Context#data returns a raw clone of the generated data`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.integer(1, 3))
    .prop('name', n => n.str(30))
    .build();

  const ctx = createContext();

  const expectedData = {
    Num: [
      new Num({ id: 1, name: 'red' }),
      new Num({ id: 3, name: 'white' }),
      new Num({ id: 2, name: 'blue' })
    ]
  };

  changeActivatorData(ctx, expectedData, { Num });

  let data = ctx.data();
  t.deepEqual(data, expectedData);
});

test(`Context#clear empties out the activator's cache`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.integer(1, 3))
    .prop('name', n => n.str(30))
    .build();
  
  const ctx = createContext();

  const expectedData = {
    Num: [
      new Num({ id: 1, name: 'red' }),
      new Num({ id: 3, name: 'white' }),
      new Num({ id: 2, name: 'blue' })
    ]
  };
  const expectedJson = JSON.stringify(expectedData);

  changeActivatorData(ctx, expectedData);

  let json = ctx.json();
  t.is(json, expectedJson);
  ctx.clear();
  json = ctx.json();
  t.is(json, EMPTY_JSON_OBJECT);
});

test(`Context#reset reverts the activator to the initial state`, t => {
  const ctx = createContext();
  const initialSeed = ctx.seed;

  t.plan(2);
  ctx['_activator'].reset = () => t.pass();
  ctx.reset();
  t.is(ctx.seed, initialSeed);
});

test(`Context#reset accepts a brand new seed`, t => {
  const ctx = createContext();
  const expectedNewSeed = -6014;
  t.plan(1);
  ctx['_activator'].reset = (actualNewSeed) => t.is(actualNewSeed, expectedNewSeed);
  ctx.reset(expectedNewSeed);
});

function createContext(cb?: (Type: Constructor, count?: number | Lookup, constants?: Lookup) => void) {
  const ctx = new Context();
  const activator = new Activator();

  activator['create'] = (Type: Constructor, count?: number | Lookup, constants?: Lookup) => {
    cb && cb(Type, count, constants);
    return [] as GeneratedArray;
  };

  ctx['_activator'] = activator;
  return ctx;
}

function changeActivatorData(ctx: Context, data: Lookup, types: Lookup = {}) {
  ctx['_activator']['_data']['_data'] = data;
  ctx['_activator']['_types'] = types;
}