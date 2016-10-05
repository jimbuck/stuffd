import { test } from 'ava';

import { ContextBuilder } from './context-builder';
import { ModelDefinition } from '../models/model-definition';

test(`creates one 'model' definition per model`, t => {
  const modelId = 'test';
  const ctx = new ContextBuilder();

  ctx.model(modelId);

  let models = ctx.build();

  t.is(models[modelId].id, modelId);
});

test(`multiple 'model' calls are combined`, t => {
  const modelId = 'test';
  const modelName = 'TestModel';
  const ctx = new ContextBuilder();

  ctx.model(modelId);
  ctx.model(modelId).name(modelName);
  ctx.model(modelId).abstract()

  let models = ctx.build();

  t.is(models[modelId].id, modelId);
  t.is(models[modelId].name, modelName);
  t.true(models[modelId].abstract);
});

test(`'inherit' accepts a model name`, t => {
  const modelId = 'test';
  const rootId = 'root';
  const ctx = new ContextBuilder();

  let rootModel = ctx.model(rootId);
  let testModel = ctx.model(modelId)
                     .inherits(rootId);

  let models = ctx.build();

  t.is(models[modelId].inherits, rootModel);
});

test(`'inherit' accepts other 'ModelBuilder's`, t => {
  const modelId = 'test';
  const rootId = 'root';
  const ctx = new ContextBuilder();

  let rootModel = ctx.model(rootId);

  let testModel = ctx.model(modelId)
    .inherits(rootModel);

  let models = ctx.build();

  t.is(models[modelId].inherits, rootModel);
});

test(`'inherit' throws on unknown models`, t => {
  const modelId = 'test';
  const nonExistentModel = 'ghost';
  const ctx = new ContextBuilder();

  let testModel = ctx.model(modelId);

  t.throws(() => {
      testModel.inherits(nonExistentModel);
  });
});

test(`'inherit' throws on null`, t => {
  const modelId = 'test';
  const ctx = new ContextBuilder();

  let testModel = ctx.model(modelId);

  t.throws(() => {
      testModel.inherits(null);
  });
});

test(`'delete' accepts a 'string'`, t => {
  const modelId = 'test';
  const ctx = new ContextBuilder();

  let testModel = ctx.model(modelId);

  ctx.delete(modelId);

  let models = ctx.build();

  t.is(typeof models[modelId], 'undefined');
});

test(`'delete' accepts a 'ModelBuilder'`, t => {
  const modelId = 'test';
  const ctx = new ContextBuilder();

  let testModel = ctx.model(modelId);

  ctx.delete(testModel);

  let models = ctx.build();

  t.is(typeof models[modelId], 'undefined');
});

test(`different contexts do not share models`, t => {
  const modelAId = 'test-a';
  const modelBId = 'test-b';
  const ctxA = new ContextBuilder();
  const ctxB = new ContextBuilder();

  let modelA = ctxA.model(modelAId);
  let modelB = ctxB.model(modelBId);

  let modelsA = ctxA.build();
  let modelsB = ctxB.build();

  t.is(modelsA[modelAId].id, modelAId);
  t.is(modelsB[modelBId].id, modelBId);
  t.is(typeof modelsA[modelBId], 'undefined');
  t.is(typeof modelsB[modelAId], 'undefined');
  t.throws(() => {
    modelA.inherits(modelB);
  });
});