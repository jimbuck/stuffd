
import { ILookup } from '../models/lookup';
import { ModelBuilder } from '../builders/model-builder';
import { PropertyDefinition } from './property-definition';

export interface ModelDefinition {
  id: string;
  name?: string;
  abstract?: boolean;
  inherits?: ModelBuilder;
  properties?: ILookup<PropertyDefinition>
}