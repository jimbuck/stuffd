import { test } from 'ava';

import { Context } from './context';
import { ModelDefinition } from '../models/model-definition';
import { Lookup } from '../models/dictionary';

test(`Context#model creates one 'model' definition per model`, t => {
  const modelId = 'test';
  const ctx = new Context();

  ctx.model(modelId);

  const models = build(ctx);

  t.is(models[modelId].id, modelId);
});

test(`Context#model throws on identical 'model' definitions`, t => {
  const modelId = 'test';
  const modelName = 'TestModel';
  const ctx = new Context();

  const modelA = ctx.model(modelId);

  t.throws(() => {
    const modelB = ctx.model(modelId);
  });
});

test(`Context#build throws on unknown inherited models`, t => {
  const modelId = 'test';
  const nonExistentModel = (new Context()).model('OtherModel');
  const ctx = new Context();

  const TestModel = ctx.model(modelId);

  TestModel.inherits(nonExistentModel);

  t.throws(() => {
      build(ctx);
  });
});

test(`different contexts do not share models`, t => {
  const modelAId = 'test-a';
  const modelBId = 'test-b';
  const ctxA = new Context();
  const ctxB = new Context();

  const ModelA = ctxA.model(modelAId);
  const ModelB = ctxB.model(modelBId);

  const modelADef = build(ctxA);
  const modelBDef = build(ctxB);

  t.is(modelADef[modelAId].id, modelAId);
  t.is(modelBDef[modelBId].id, modelBId);
  t.is(typeof modelADef[modelBId], 'undefined');
  t.is(typeof modelBDef[modelAId], 'undefined');
});

test(`Context#task updates the task cache`, t => {
  const taskId = 'testTask';
  const ctx = new Context();

  const testTask = () => {
    // Nothing to do here...
  };

  ctx.task(taskId, testTask);

  t.is(ctx['_taskCache'].get(taskId), testTask);
});

function build(ctx: Context): Lookup<ModelDefinition> {
  return ctx['_build']();
}