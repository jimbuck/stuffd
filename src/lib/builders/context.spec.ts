import { test } from 'ava';

import { Lookup } from '../models/dictionary';
import { Context } from './context';
import { ExecutionContext } from './execution-context';
import { ModelDefinition } from '../models/model-definition';

test(`Context#model creates one 'model' definition per model`, t => {
  const modelId = 'test';
  const ctx = new Context();

  ctx.model(modelId);

  const models = build(ctx);

  t.is(models[modelId].id, modelId);
});

test(`Context#model throws on identical 'model' definitions`, t => {
  const modelId = 'TestModel';
  const ctx = new Context();

  ctx.model(modelId);

  t.throws(() => {
    ctx.model(modelId);
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

function build(ctx: Context): Lookup<ModelDefinition> {
  return ctx['_build']();
}