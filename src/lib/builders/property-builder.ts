
import { Enum, MapExpr, ReduceExpr, AggregateDefinition, LazyArray, TypeIdentifier } from '../models/types';

import { PropertyDefinition } from '../models/property-definition';

export class PropertyBuilder {

  private _definition: PropertyDefinition;

  constructor(propDef?: PropertyDefinition) {
    this._definition = propDef || {};
  }

  public name(name: string): this {
    this._definition.name = name;
    return this;
  }

  public min(min: number): this {
    this._definition.min = min;
    return this;
  }

  public max(max: number): this {
    this._definition.min = max;
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

  public type(type: TypeIdentifier, secondaryType?: TypeIdentifier): this {
    this._definition.type = type;
    if (secondaryType) {
      this._definition.secondaryType = secondaryType;
    }
    return this;
  }

  public array(secondaryType?: TypeIdentifier): this {
    return this.type(Array, secondaryType);
  }

  public enum(secondaryType?: TypeIdentifier): this {
    return this.type(Enum, secondaryType);
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

  public choices<T>(choices: LazyArray<T>): this {
    this._definition.choices = choices;

    return this;
  }
  
  public build(): PropertyDefinition {
    return Object.assign({}, this._definition);
  }

}