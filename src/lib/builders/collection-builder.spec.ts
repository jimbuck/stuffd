import { test } from 'ava';
import { CollectionBuilder  } from './collection-builder';
import { Activator } from '../services/activator';
import { Lookup, Constructor, GeneratedArray } from '../models/types';
import { StaticCreate } from './model-builder';

test(`CollectionBuilder#using stores the explicit property options`, t => {
  const batch1 = ['red', 'white', 'blue'];
  const batch2 = ['red', 'green', 'blue'];
  const expectedRefs = [...batch1, ...batch2];
  const expectedKey = 'specialRefs';

  const cb = new CollectionBuilder(createMockActivator());
  cb.using({
    [expectedKey]: batch1
  });
  t.deepEqual(cb['_explicitRefs'].get(expectedKey), batch1);

  cb.using({
    [expectedKey]: batch2
  });
  t.deepEqual(cb['_explicitRefs'].get(expectedKey), expectedRefs);
});

test(`CollectionBuilder#cross stores the crossed properties`, t => {
  const color = ['red', 'white', 'blue'];
  const num = [1, 2];

  const expectedCrossRefs = { color, num };
  
  const cb = new CollectionBuilder(createMockActivator());
  cb.cross(expectedCrossRefs);

  t.is(cb['_crossRefs'], expectedCrossRefs);
});

test(`CollectionBuilder#cross can only be called once`, t => {
  const color = ['red', 'white', 'blue'];
  const num = [1, 2];

  const cb = new CollectionBuilder(createMockActivator());
  cb.cross({ color, num });

  t.throws(() => cb.cross({ color, num }));
});

test(`CollectionBuilder#create requires count or cross`, t => {
  const Num = StaticCreate('Num').key('id', id => id.choices([1, 2])).build();

  const cb = new CollectionBuilder(createMockActivator());

  t.throws(() => cb.create(Num));
});

test(`CollectionBuilder#create returns exact count for non-crossed`, t => {
  const Num = StaticCreate('Num').key('id', id => id.guid()).build();

  const expectedCount = 7;

  const mockActivator = createMockActivator((Type, count, constants) => {
    t.is(count, expectedCount);
  });
  const cb = new CollectionBuilder(mockActivator);

  cb.create(Num, expectedCount);
});

test(`CollectionBuilder#create returns result for each cross`, t => {
  const color = ['red', 'white', 'blue'];
  const num = [1, 2];

  const Col = StaticCreate('Col').key('id', c => c.choices(color)).build();
  const Num = StaticCreate('Num').key('id', id => id.choices(num)).build();
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
  
  const mockActivator = createMockActivator((Type, cross, constants) => {
    t.deepEqual(cross, expectedRefs);
  });

  new CollectionBuilder(mockActivator).cross(crosses).create(TestThing);
});

test(`CollectionBuilder#create requires each list to have one or more generated items`, t => {
  const Col = StaticCreate('Col').key('id', c => c.choices(['red', 'white', 'blue'])).build();
  const Num = StaticCreate('Num').key('id', id => id.choices([1, 2])).build();
  const TestThing = StaticCreate('TestThing')
    .key('id', id => id.guid())
    .ref('color', Col)
    .ref('num', Num)
    .build();

  const invalidColor = [{ id: 'red' }, { id: 'white' }, { id: 'blue' }];
  const validColor = [new Col({ id: 'red' }), new Col({ id: 'white' }), new Col({ id: 'blue' })];
  
  const invalidNum = [{ id: 1 }, { id: 2 }];
  const validNum = [new Num({ id: 1 }), new Num({ id: 2 })];
  
  const mockActivator = createMockActivator();

  t.throws(() => new CollectionBuilder(mockActivator).cross({ color: invalidColor, num: validNum }).create(TestThing));
  t.throws(() => new CollectionBuilder(mockActivator).cross({ color: validColor, num: invalidNum }).create(TestThing));
  t.throws(() => new CollectionBuilder(mockActivator).cross({ color: invalidColor, num: invalidNum }).create(TestThing));
  t.notThrows(() => new CollectionBuilder(mockActivator).cross({ color: validColor, num: validNum }).create(TestThing));
});

test(`CollectionBuilder#create accepts an override of constants`, t => {
  const Num = StaticCreate('Num')
    .key('id', id => id.guid())
    .prop('name', n => n.str(30))
    .build();

  const expectedConstants = {
    name: 'constant-name'
  };

  const mockActivator = createMockActivator((Type, count, constants) => {
    t.deepEqual(constants, expectedConstants);
  });
  const cb = new CollectionBuilder(mockActivator);

  cb.create(Num, 3, expectedConstants);
});

function createMockActivator(cb?: (Type: Constructor, count?: number | Lookup, constants?: Lookup) => void) {
  const activator = new Activator();

  activator['create'] = (Type: Constructor, count?: number | Lookup, constants?: Lookup) => {
    cb && cb(Type, count, constants);
    return [] as GeneratedArray;
  };

  return activator;
}