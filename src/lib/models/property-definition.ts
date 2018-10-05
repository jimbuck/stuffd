
import { TypeDefinition } from './types';

/**
 * Set of properties which are used to define model properties.
 * 
 * @export
 * @interface PropertyDefinition
 */
export interface PropertyDefinition {
  
  /**
   * The property identifier, usually the type name.
   * 
   * @type {string}
   * @memberOf PropertyDefinition
   */
  id?: string;

  /**
   * The full name of the property, usually used as the column name.
   * 
   * @type {string}
   * @memberOf PropertyDefinition
   */
  name?: string;

  /**
   * Is this property the primary key?
   * 
   * @type {boolean}
   * @memberOf PropertyDefinition
   */
  key?: boolean;

  ref?: TypeDefinition;

  /**
   * The minimum indicator, for numbers, dates, etc.
   * 
   * @type {number | Date}
   * @memberOf PropertyDefinition
   */
  min?: number | Date;
  max?: number | Date;
  length?: number;
  pattern?: RegExp;
  patternFn?: () => string;
  optional?: number;
  type?: any;
  secondaryType?: any;
  designType?: any;
  decimals?: number,
  choices?: any[] | (() => any[]);
  truthRate?: number;
}