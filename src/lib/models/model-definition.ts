
import { PropertyDefinition } from './property-definition';
import { Constructor, Lookup  } from './types';

export interface ModelDefinition<T=any> {
  name: string;
  inherits?: Constructor;
  primaryKey?: string;
  toStringFn?: (x: any) => string;
  props?: {
    [P in keyof T]?: PropertyDefinition;
  } & Lookup
}