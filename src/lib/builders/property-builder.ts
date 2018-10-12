
import { TypeReference, GuidType, CustomGenerator, Constructor } from '../models/types';
import { getPrimaryKey } from '../utils/meta-reader';
import { PropertyDefinition } from '../models/property-definition';
import { Model } from '../..';
import { StoredEnum } from '../models/stored-enum';

export class PropertyBuilder {

  private _definition: PropertyDefinition;

  constructor(propDef?: PropertyDefinition) {
    this._definition = propDef || {};
  }

  public static build(propBuilder: PropertyBuilder): PropertyDefinition {
    return Object.assign({}, propBuilder._definition);
  }

  public ref<T, K extends keyof T>(type: Constructor<T>, refKey?: K): this {
    let foreignKey = typeof refKey === 'string' ? refKey : getPrimaryKey(type);
    if (!foreignKey) {
      throw new Error('Failed to infer primary key of reference type!');
    }
    
    this._definition.ref = type;
    this._definition.foreignKey = foreignKey;
    return this;
  }

  public range(min: number, max: number): this;
  public range(min: Date, max: Date): this;
  public range(min: number | Date, max: number | Date): this {
    if (max < min) throw new Error(`max must be equal to or greater than min!`);

    this._definition.min = min;
    this._definition.max = max;
    return this;
  }

  public length(len: number): this {
    return this.range(len, len);
  }

  public pick<T>(choices: T[] | (() => T[])): this {
    this._definition.pick = Array.isArray(choices) ? choices.slice() : choices;
    return this;
  }

  public type(type: TypeReference, secondaryType?: TypeReference): this {
    this._definition.type = type;
    if (secondaryType) {
      this._definition.secondaryType = secondaryType;
    }
    return this;
  }

  public list(itemType?: TypeReference): this {
    return this.type(Array, itemType);
  }

  public guid(): this {
    return this.type(GuidType);
  }

  public enum(enumType: any): this {
    const storedEnum = new StoredEnum(enumType);
    this._definition.type = storedEnum;
    return this;
  }

  public str(): this;
  public str(length: number): this;
  public str(minLength: number, maxLength: number): this;
  public str(pattern: RegExp): this;
  public str(pattern?: number | RegExp, maxLength?: number): this {
    this.type(String);
    
    if (pattern instanceof RegExp) {
      this._definition.pattern = pattern;
    } else if (typeof pattern === 'number') {
      maxLength = maxLength || pattern;
      this.range(pattern, maxLength);
    }
    
    return this;
  }

  public bool(truthRate: number = 0.5): this {
    this._definition.truthRate = truthRate;
    this._definition.type = Boolean;
    return this;
  }

  public optional(occuranceRate: number = 0.5): this {
    this._definition.optional = occuranceRate;
    return this;
  }

  public integer(): this;
  public integer(min: number, max: number): this;
  public integer(min: number = Model.defaults.minInteger, max: number = Model.defaults.maxInteger): this {
    this._definition.decimals = 0;
    
    return this
      .type(Number)
      .range(min, max);
  }

  public float(): this;
  public float(decimals: number): this;
  public float(min: number, max: number): this;
  public float(decimals: number, min: number, max: number): this;
  public float(decimals?: number, min?: number, max?: number): this {
    
    if (arguments.length === 2) {
      max = min;
      min = decimals;
      decimals = null;
    }

    if (typeof min === 'undefined') {
      min = Model.defaults.minFloat;
      max = Model.defaults.maxFloat;
    }

    if (typeof decimals === 'number') {
      this._definition.decimals = decimals;
    }

    return this
      .type(Number)
      .range(min, max);
  }

  public date(): this;
  public date(min: Date, max: Date): this;
  public date(min?: Date, max?: Date): this {
    return this
      .type(Date)
      .range(min, max)
  }

  public custom(fn: CustomGenerator): this {
    this._definition.custom = fn;
    return this;
  }
}