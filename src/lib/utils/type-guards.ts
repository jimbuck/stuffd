import { ModelBuilder } from '../builders/model-builder';
import { ModelDefinition } from '../models/model-definition';
import { Constructor, GuidType, TypeReference } from '../models/types';
import { StoredEnum } from '../models/stored-enum';


export function isConstructor<T>(fn: StoredEnum | GuidType | ModelBuilder | ModelDefinition | Constructor<T>): fn is Constructor<T> {
  return typeof fn === 'function';
}
export function isStoredEnum<T>(fn: TypeReference<T>): fn is StoredEnum {
  return fn instanceof StoredEnum;
}