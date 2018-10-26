
import { TypeReference, CustomGenerator, Constructor } from './types';
import { StoredEnum } from './stored-enum';

/**
 * Set of properties which are used to define model properties.
 * 
 * @export
 * @interface PropertyDefinition
 */
export interface PropertyDefinition {
  name?: string;
  key?: boolean;
  ref?: Constructor;
  foreignKey?: string;
  min?: number | Date;
  max?: number | Date;
  pattern?: RegExp;
  optional?: number;
  type?: TypeReference;
  secondaryType?: TypeReference;
  designType?: any;
  decimals?: number,
  pick?: any[] | (() => any[]);
  truthRate?: number;
  custom?: CustomGenerator; 
}