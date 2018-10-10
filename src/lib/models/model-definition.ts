
import { Lookup } from '../models/dictionary';
import { PropertyDefinition } from './property-definition';
import { Constructor } from './types';

export interface ModelDefinition {
  id: string;
  name?: string;
  inherits?: Constructor;
  primaryKey?: string;
  toStringFn?: (x: any) => string;
  props?: Lookup<PropertyDefinition>
}