
import { ILookup } from '../models/lookup';
import { Model } from '../builders/model';
import { PropertyDefinition } from './property-definition';

export interface ModelDefinition {
  id: string;
  name?: string;
  inherits?: Model;
  properties?: ILookup<PropertyDefinition>
}