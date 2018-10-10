import { test } from 'ava';

import { isConstructor } from './type-guards';
import { ModelDefinition } from '../models/model-definition';
import { EnumType, GuidType } from '../models/types';

test(`isConstructor detects functions that could be a constructor`, t => {
  class TestClass {

  }
  
  t.true(isConstructor(TestClass));
  t.true(isConstructor((() => { }) as any));
});

test(`isConstructor denies entites that are definitely not constructors`, t => {
  t.false(isConstructor({} as ModelDefinition));
  t.false(isConstructor(EnumType));
  t.false(isConstructor(GuidType));
});