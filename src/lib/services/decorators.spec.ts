import { test } from 'ava';

import { ModelDecorator as Model, PropDecorator as Prop } from './internal-decorators';
import {
  Type, Float, Integer, Bool, Guid, Enum,
  Key, Length, Optional, Range, Choice, Str, Ref, Custom, Collection,
} from './decorators';

test.todo(`Model.create returns a model builder`);

test.todo(`Model adds a model defintion to the metadata`);

test.todo(`Prop adds PropertyDefinition fields to the metadata`);

test.todo(`Prop adds complex types to the definition`);

test.todo(`Key marks the property as a key`);

test.todo(`Length specifies an exact range`);

test.todo(`Optional defaults to 50/50`);

test.todo(`Optional allows for a custom truth rate`);

test.todo(`Range accepts min/max numbers`);

test.todo(`Range accepts min/max dates`);

test.todo(`Type specifies the primary and secondary type`);