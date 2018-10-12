import 'reflect-metadata';
import { Constructor } from '../models/types';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from '../builders/model-builder';


export function getDesignType(target: Object, prop: string) {
  return Reflect.getMetadata('design:type', target, prop);
}

//#region Model Builder Methods

export const ModelBuilderKey = Symbol('jimmyboh:stuffd:modelbuilder');
export function getModelBuilder<T>(Target: Constructor<T>): ModelBuilder<T> {
  return Reflect.getMetadata(ModelBuilderKey, Target) || new ModelBuilder({ name: null });
}
export function setModelBuilder<T>(Target: Constructor<T>, modelBuilder: ModelBuilder<T>): void {
  Reflect.defineMetadata(ModelBuilderKey, modelBuilder, Target);
}
export function removeModelBuilder<T>(Target: Constructor<T>): void {
  Reflect.deleteMetadata(ModelBuilderKey, Target);
}

//#endregion

//#region Model Definition Methods

export const ModelDefinitionKey = Symbol('jimmyboh:stuffd:modeldef');
export function getModelDef<T>(Target: Constructor<T>): ModelDefinition<T> {
  return Reflect.getMetadata(ModelDefinitionKey, Target) || { props: {} };
}
export function setModelDef<T>(Target: Constructor<T>, modelDef: ModelDefinition<T>): void {
  Reflect.defineMetadata(ModelDefinitionKey, modelDef, Target);
}
export function removeModelDef<T>(Target: Constructor<T>): void {
  Reflect.deleteMetadata(ModelDefinitionKey, Target);
}
//#endregion

export function getModelId<T>(Target: Constructor<T>): string {
  
  let modelDef = getModelDef<T>(Target);

  if (modelDef && modelDef.name) return modelDef.name;

  throw new Error(`Cannot get model ID for '${Target}'`);
}

export function getPrimaryKey<T>(type: Constructor<any>): string {
  let modelDef = getModelDef<T>(type);

  return modelDef.primaryKey;
}