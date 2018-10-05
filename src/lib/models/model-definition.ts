
import { Lookup } from '../models/dictionary';
import { ModelBuilder } from '../builders/model';
import { PropertyDefinition } from './property-definition';

export interface ModelDefinition {
  id: string;
  name?: string;
  inherits?: ModelBuilder;
  props?: Lookup<PropertyDefinition>
}