import { ModelBuilder } from '../builders/model-builder';
import { ModelDefinition } from '../models/model-definition';
import { Constructor, EnumType, GuidType } from '../models/types';


export function isConstructor<T>(fn: EnumType | GuidType | ModelBuilder | ModelDefinition | Constructor<T>): fn is Constructor<T> {
  return typeof fn === 'function';
}