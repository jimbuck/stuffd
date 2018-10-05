
import { Lookup } from '../models/dictionary';
import { Model } from '../builders/model';
import { PropertyDefinition } from './property-definition';

export interface ModelDefinition {
  id: string;
  name?: string;
  inherits?: Model;
  props?: Lookup<PropertyDefinition>
}