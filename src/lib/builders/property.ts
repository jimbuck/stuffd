
import { Enum, MapExpr, ReduceExpr, AggregateDefinition, Lazy, Type, Index, Guid } from '../models/types';

import { PropertyDefinition } from '../models/property-definition';

export class Property {

  private _definition: PropertyDefinition;

  constructor(propDef?: PropertyDefinition) {
    this._definition = propDef || {};
  }

  public name(name: string): this {
    this._definition.name = name;
    return this;
  }

  public key(): this {
    this._definition.key = true;
    return this;
  }

  public ref(type: Type): this {
    this._definition.ref = type;
    return this;
  }

  public min(min: number): this {
    this._definition.min = min;
    return this;
  }

  public max(max: number): this {
    this._definition.max = max;
    return this;
  }

  public length(len: number): this {
    this._definition.length = len;
    return this;
  }

  public optional(rate: number = 0.5): this {
    this._definition.optional = rate;
    return this;
  }

  public unique(unique = true): this {
    this._definition.unique = unique;
    return this;
  }

  public type(type: Type, secondaryType?: Type): this {
    this._definition.type = type;
    if (secondaryType) {
      this._definition.secondaryType = secondaryType;
    }
    return this;
  }

  public integer(min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER): this {    
    return this
      .type(Number)
      .decimals(0)
      .min(min)
      .max(max);
  }

  public float(min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE): this {    
    return this
      .type(Number)
      .min(min)
      .max(max);
  }

  public string(pattern?: string | RegExp): this {
    this.type(String);
    
    if (pattern) {
      this.pattern(pattern);
    }
    
    return this;
  }

  public array(itemType?: Type): this {
    return this.type(Array, itemType);
  }

  public enum(referenceType?: Type): this {
    return this.type(Enum, referenceType);
  }

  public guid(): this {
    return this.type(Guid);
  }

  public pattern(pattern: string | RegExp): this {
    // TODO: Convert wildcard string into regexp...
    this._definition.pattern = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this;
  }

  public index(): this {
    return this.type(Index);
  }

  public decimals(decimals: number): this {
    this._definition.decimals = decimals;
    return this;
  }
  
  public sum<TModel,TProp>(prop: MapExpr<TModel, Array<TProp>> | string, val?: ReduceExpr<TProp, number>): this {
    if (typeof prop !== 'function' && (!prop.length || prop.length < 1)) {
      throw new Error(`'prop' must be defined!`);
    }
    this._definition.type = Number;
    this._definition.sum = {
      map: typeof prop === 'function' ? prop : (x => x[prop]),
      reduce: val || (x => x)
    };

    return this;
  }

  public choices<T>(choices: Lazy<T[]>): this {
    this._definition.choices = choices;

    return this;
  }
  
  public build(): PropertyDefinition {
    return Object.assign({}, this._definition);
  }

}