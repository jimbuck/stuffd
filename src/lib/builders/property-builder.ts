
import { TypeReference, GuidType, CustomGenerator, Constructor } from '../models/types';
import { getPrimaryKey } from '../services/meta-reader';
import { PropertyDefinition } from '../models/property-definition';

export class PropertyBuilder {

  private _definition: PropertyDefinition;

  constructor(propDef?: PropertyDefinition) {
    this._definition = propDef || {};
  }

  public static build(propBuilder: PropertyBuilder): PropertyDefinition {
    return Object.assign({}, propBuilder._definition);
  }

  public key(): this {
    this._definition.key = true;
    return this;
  }

  public ref<T, K extends keyof T>(type: Constructor<T>, refKey?: K): this {
    this._definition.ref = type;
    this._definition.foreignKey = typeof refKey === 'string' ? refKey : getPrimaryKey(type);
    return this;
  }

  public range(min: number, max: number): this;
  public range(min: Date, max: Date): this;
  public range(min: number | Date, max: number | Date): this {
    this._definition.min = min;
    this._definition.max = max;
    return this;
  }

  public length(len: number): this {
    this._definition.length = len;
    return this;
  }

  public decimals(decimals: number): this {
    this._definition.decimals = decimals;
    return this;
  }

  public choices<T>(choices: T[] | (() => T[])): this {
    this._definition.choices = choices;

    return this;
  }

  public type(type: TypeReference, secondaryType?: TypeReference): this {
    this._definition.type = type;
    if (secondaryType) {
      this._definition.secondaryType = secondaryType;
    }
    return this;
  }

  public array(itemType?: TypeReference): this {
    return this.type(Array, itemType);
  }

  public guid(): this {
    return this.type(GuidType);
  }

  public string(): this;
  public string(minLength: number, maxLength: number): this;
  public string(pattern: RegExp): this;
  public string(pattern?: number | RegExp, maxLength?: number): this {
    this.type(String);
    
    if (pattern instanceof RegExp) {
      // TODO: Convert wildcard string into regexp...
      this._definition.pattern = pattern;
    } else if(typeof pattern === 'number') {
      this.range(pattern, maxLength);
    }
    
    return this;
  }

  public integer(): this;
  public integer(min: number, max: number): this;
  public integer(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): this {

    return this
      .type(Number)
      .decimals(0)
      .range(min, max);
  }

  public float(): this;
  public float(min: number, max: number): this;  
  public float(min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE): this {    
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