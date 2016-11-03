import { test } from 'ava';

import { Context } from './context';
import { ModelDefinition } from '../models/model-definition';

test(`creates one 'model' definition per model`, t => {
  const modelId = 'test';
  const ctx = new Context();

  ctx.model(modelId);

  let models = ctx['_build']();

  t.is(models[modelId].id, modelId);
});

test(`identical 'model' definitions throw`, t => {
  const modelId = 'test';
  const modelName = 'TestModel';
  const ctx = new Context();

  t.throws(() => {
    let modelA = ctx.model(modelId);
    let modelB = ctx.model(modelId);
  });
});

test(`'inherit' accepts a model name`, t => {
  const modelId = 'test';
  const rootId = 'root';
  const ctx = new Context();

  let rootModel = ctx.model(rootId);
  let testModel = ctx.model(modelId)
                     .inherits(rootId);

  let models = ctx['_build']();

  t.is(models[modelId].inherits, rootModel);
});

test(`'inherit' accepts other 'ModelBuilder's`, t => {
  const modelId = 'test';
  const rootId = 'root';
  const ctx = new Context();

  let rootModel = ctx.model(rootId);

  let testModel = ctx.model(modelId)
    .inherits(rootModel);

  let models = ctx['_build']();

  t.is(models[modelId].inherits, rootModel);
});

test(`'inherit' throws on unknown models`, t => {
  const modelId = 'test';
  const nonExistentModel = 'ghost';
  const ctx = new Context();

  let testModel = ctx.model(modelId);

  t.throws(() => {
      testModel.inherits(nonExistentModel);
  });
});

test(`'inherit' throws on null`, t => {
  const modelId = 'test';
  const ctx = new Context();

  let testModel = ctx.model(modelId);

  t.throws(() => {
      testModel.inherits(null);
  });
});

test(`different contexts do not share models`, t => {
  const modelAId = 'test-a';
  const modelBId = 'test-b';
  const ctxA = new Context();
  const ctxB = new Context();

  let modelA = ctxA.model(modelAId);
  let modelB = ctxB.model(modelBId);

  let modelsA = ctxA['_build']();
  let modelsB = ctxB['_build']();

  t.is(modelsA[modelAId].id, modelAId);
  t.is(modelsB[modelBId].id, modelBId);
  t.is(typeof modelsA[modelBId], 'undefined');
  t.is(typeof modelsB[modelAId], 'undefined');
  t.throws(() => {
    modelA.inherits(modelB);
  });
});