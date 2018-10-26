import 'reflect-metadata';
import { Constructor } from '../models/types';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from '../builders/model-builder';


export function getDesignType(target: Object, prop: string) {
  return Reflect.getMetadata('design:type', target, prop);
}

//#region Model Builder Methods

const ModelBuilderKey = '_modelbuilder';
export function getModelBuilder<T=any>(Target: Constructor<T>): ModelBuilder<T> {
  return (Target as any)[ModelBuilderKey] || new ModelBuilder({ name: null });
}
export function setModelBuilder<T>(Target: Constructor<T>, modelBuilder: ModelBuilder<T>): void {
  
  Object.defineProperty(Target, ModelBuilderKey, { value: modelBuilder, enumerable: false, configurable: true });
}
export function removeModelBuilder<T>(Target: Constructor<T>): void {
  delete (Target as any)[ModelBuilderKey];
}

//#endregion

//#region Model Definition Methods

const ModelDefinitionKey = '_modeldef';
export function getModelDef<T>(Target: Constructor<T>): ModelDefinition<T> {
  return (Target as any)[ModelDefinitionKey] || { props: {}, propList: [], nativeDefinitions: {} };
}
export function setModelDef<T>(Target: Constructor<T>, modelDef: ModelDefinition<T>): void {
  Object.defineProperty(Target, ModelDefinitionKey, { value: modelDef, enumerable: false, configurable: true });
}
export function removeModelDef<T>(Target: Constructor<T>): void {
  delete (Target as any)[ModelDefinitionKey];
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