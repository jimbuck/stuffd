import 'reflect-metadata';
import { Constructor } from '../models/types';
import { ModelDefinition } from '../models/model-definition';

export const ModelDefinitionKey = Symbol('jimmyboh:stuffd:modeldef');

export function getDesignType(target: Object, prop: string) {
  return Reflect.getMetadata('design:type', target, prop);
}

export function getModelDef<T>(Target: Constructor<T>): ModelDefinition {
  return Reflect.getMetadata(ModelDefinitionKey, Target) || {
    props: {}
  };
}

export function getModelId<T>(Target: Constructor<T>): string {
  
  let modelDef = getModelDef(Target);

  if (modelDef && modelDef.id) return modelDef.id;

  throw new Error(`Cannot get model ID for '${Target}'`);
}

export function setModelDef<T>(Target: Constructor<T>, modelDef: ModelDefinition): void {
  Reflect.defineMetadata(ModelDefinitionKey, modelDef, Target);
}

export function getPrimaryKey(type: Constructor<any>): string {
  let modelDef = getModelDef(type);

  return modelDef.primaryKey;
}