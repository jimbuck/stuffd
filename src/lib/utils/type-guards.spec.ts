import { test } from 'ava';

import { isConstructor } from './type-guards';
import { ModelDefinition } from '../models/model-definition';
import { GuidType } from '../models/types';
import { StoredEnum } from '../models/stored-enum';

test(`isConstructor detects functions that could be a constructor`, t => {
  class TestClass {

  }
  
  t.true(isConstructor(TestClass));
  t.true(isConstructor((() => { }) as any));
});

test(`isConstructor denies entites that are definitely not constructors`, t => {

  enum LightSwitch {
    Off, On
  }

  t.false(isConstructor({} as ModelDefinition));
  t.false(isConstructor(new StoredEnum(LightSwitch)));
  t.false(isConstructor(GuidType));
});