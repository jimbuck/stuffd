import { ModelBuilder } from '../builders/model-builder';
import { ModelDefinition } from '../models/model-definition';
import { Constructor } from '../models/types';


export function isConstructor<T>(fn: ModelBuilder | ModelDefinition | Constructor<T>): fn is Constructor<T> {
  return typeof fn === 'function';
}