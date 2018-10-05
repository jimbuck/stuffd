import 'reflect-metadata';
import { Constructor } from '../models/types';
import { ModelDefinition } from '../models/model-definition';

export const StuffMetadataKey = Symbol('jimmyboh.stuff.metadata');

export function getDesignType(target: Object, prop: string) {
  return Reflect.getMetadata('design:type', target, prop);
}

export function getModelDef<T>(Target: Constructor<T>): ModelDefinition {
  return Reflect.getMetadata(StuffMetadataKey, Target) || {
    props: {}
  };
}

export function setModelDef<T>(Target: Constructor<T>, modelDef: ModelDefinition): void {
  Reflect.defineMetadata(StuffMetadataKey, modelDef, Target);
}