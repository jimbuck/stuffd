
import { AggregateDefinition, TypeDefinition } from './types';

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
   * The minimum indicator, for numbers, dates, string lengths, etc.
   * 
   * @type {number}
   * @memberOf PropertyDefinition
   */
  min?: number;
  max?: number;
  length?: number;
  pattern?: RegExp;
  optional?: number;
  unique?: boolean;
  type?: any;
  secondaryType?: any;
  decimals?: number,
  sum?: AggregateDefinition<any, any, number>;
  choices?: any[] | (() => any[]);
  ignore?: boolean;
}