
import { TypeReference, CustomGenerator } from './types';
import { StoredEnum } from './stored-enum';

/**
 * Set of properties which are used to define model properties.
 * 
 * @export
 * @interface PropertyDefinition
 */
export interface PropertyDefinition {
  
  /**
   * The property name.
   */
  name?: string;

  /**
   * Is this property the primary key?
   * 
   * @type {boolean}
   * @memberOf PropertyDefinition
   */
  key?: boolean;

  ref?: TypeReference;
  foreignKey?: string;

  /**
   * The minimum indicator, for numbers, dates, etc.
   * 
   * @type {number | Date}
   * @memberOf PropertyDefinition
   */
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