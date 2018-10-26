
import { PropertyDefinition } from './property-definition';
import { Constructor, Lookup  } from './types';


export interface ModelDefinition<T=any> {
  name: string;
  inherits?: Constructor;
  primaryKey?: string;
  nativeDefinitions?: PropertyDescriptorMap & ThisType<T>;
  propList?: string[];
  props?: {
    [P in Extract<keyof T, string>]?: PropertyDefinition;
  }
}