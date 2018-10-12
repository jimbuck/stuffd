
import { PropertyDefinition } from './property-definition';
import { Lookup, Constructor  } from './types';

export interface ModelDefinition {
  name: string;
  inherits?: Constructor;
  primaryKey?: string;
  toStringFn?: (x: any) => string;
  props?: Lookup<PropertyDefinition>
}