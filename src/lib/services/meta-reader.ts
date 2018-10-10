import 'reflect-metadata';
import { Constructor } from '../models/types';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from '../builders/model-builder';
import { isConstructor } from '../utils/type-guards';

export const StuffMetadataKey = Symbol('jimmyboh.stuff.metadata');

export function getDesignType(target: Object, prop: string) {
  return Reflect.getMetadata('design:type', target, prop);
}

export function getModelDef<T>(Target: Constructor<T>): ModelDefinition {
  return Reflect.getMetadata(StuffMetadataKey, Target) || {
    props: {}
  };
}

export function getModelId<T>(Target: Constructor<T>|ModelBuilder|ModelDefinition): string {
  if (Target instanceof ModelBuilder) {
    return Target.id;
  }

  let modelDef;
  if (isConstructor(Target)) {
    modelDef = getModelDef(Target);
  } else {
    modelDef = Target;
  }

  if (modelDef && modelDef.id) return modelDef.id;

  throw new Error(`Cannot get model ID for '${Target}'`);
}

export function setModelDef<T>(Target: Constructor<T>, modelDef: ModelDefinition): void {
  Reflect.defineMetadata(StuffMetadataKey, modelDef, Target);
}

export function getForeignKey(type: Constructor<any>): string {
  let modelDef = getModelDef(type);

  return modelDef.primaryKey;
}