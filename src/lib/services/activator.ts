import { Lookup, Constructor, GuidType, EnumType } from '../models/types';
import { StoredEnum } from '../models/stored-enum';
import { PropertyDefinition } from '../models/property-definition';
import { ModelDefinition } from '../models/model-definition';
import { getModelDef } from '../utils/meta-reader';
import { Random } from '../utils/random';
import { ListBucket } from '../models/list-bucket';
import { Model } from '../..';

export class Activator {

  private _rand: Random;
  private _cache: ListBucket;

  constructor(seed?: number) {
    this._cache = new ListBucket();
    this._rand = new Random(seed);
  }

  public get seed() {
    return this._rand.seed;
  }

  public create<T>(Type: Constructor<T>, count: number | Lookup<any>, constants?: Lookup<any>): T[];
  public create<T>(Type: Constructor<T>, crossed: Array<Lookup<any>>, constants?: Lookup<any>): T[];
  public create<T>(Type: Constructor<T>, countOrCrossed: number|Array<Lookup<any>>, constants: Lookup<any> = {}): T[] {
    
    let modelDef = getModelDef(Type);

    if (!modelDef) {
      throw new Error(`No model definition found for ${Type.name}`);
    }

    if (typeof countOrCrossed === 'number') {
      let count = Math.floor(countOrCrossed);
      if (count < 1) {
        throw new Error(`Count must be greater than zero when generating entites!`);
      }

      let results = Array(count).fill(0).map(() => this._createModel(Type as Constructor<T>, modelDef, constants));
      return this._cache.add(modelDef.id, results);
    } else {
      let crossed = countOrCrossed;
      let results = crossed.map(cross => this._createModel(Type as Constructor<T>, modelDef, Object.assign({}, cross, constants)));
      return this._cache.add(modelDef.id, results);
    }
  }

  public data() {
    return this._cache;
  }

  public clear() {
    this._cache.clear();
  }

  private _createModel<T>(Type: Constructor<T>, modelDef: ModelDefinition, constants: Lookup<any> = {}): T {
    let target: any = new Type();
    for (let prop in modelDef.props) {
      let propDef = modelDef.props[prop];
      if (typeof propDef.optional === 'number' && !this._rand.nextBoolean(propDef.optional)) continue;

      target[prop] = this._createProp(propDef);
    }
    Object.assign(target, constants);
    return target;
  }

  private _createProp(def: PropertyDefinition): any {
    if (typeof def.choices !== 'undefined') {
      let choices = def.choices;
      if (typeof choices === 'function') choices = choices();
      return this._rand.choice(choices);
    }

    if (def.custom) {
      return this._rand.chance(def.custom);
    }

    if (def.ref) {
      // TODO: Find an instance and get the foreignKey...
      return '<TODO>';
    }

    switch (def.type) {
      case (RegExp as any):
        throw new Error('RegExp cannot be generated randomly!');
      case Boolean:
        return this._rand.nextBoolean(def.truthRate);
      case Number:
        return this._createNumber(def);
      case Date:
        return this._createDate(def);
      case String:
        return this._createString(def);
      case GuidType:
        return this._rand.nextGuid();
      case EnumType:
        return this._createEnum(def);
      case Array:
        return this._createArray(def);
      default:
        // Complex object...
        return this.create(def.type, 1)[0];
    }
  }

  private _createNumber(def: PropertyDefinition): number {
    let min, max;
    if (typeof def.min === 'number') min = def.min;
    if (typeof def.max === 'number') max = def.max;
    if (typeof min !== typeof max) throw new Error('Must use both min/max or neither with numbers!');

    if (def.decimals === 0) {
      return this._rand.nextInt(def.min as number, def.max as number);
    }
    return this._rand.nextFloat(def.min as number, def.max as number, def.decimals);
  }

  private _createDate(def: PropertyDefinition): Date {
    let min, max;
    if (def.min instanceof Date) min = def.min;
    if (def.max instanceof Date) max = def.max;
    if (!!min !== !!max) throw new Error('Must use both min/max or neither with Dates!');
    min = min || new Date(0);
    max = max || new Date();

    return this._rand.nextDate(min, max);
  }

  private _createString(def: PropertyDefinition): string {
    if (def.pattern) {
      return this._rand.nextPattern(def.pattern);
    }

    let min, max;
    if (typeof def.min === 'number') min = def.min;
    if (typeof def.max === 'number') max = def.max;
    if (typeof min !== typeof max) throw new Error('Must use both min/max or neither with string lengths!');
    if (typeof min !== 'number') {
      min = Model.defaults.minString;
      max = Model.defaults.maxString;
    }

    let length = this._rand.nextInt(min, max);
    return this._rand.nextString(length);
  }

  private _createEnum(def: PropertyDefinition): any {
    let EnumType = def.secondaryType as StoredEnum;
    switch (def.designType) {
      case String:
        return this._rand.choice(EnumType.names);
      case Number:
        return this._rand.choice(EnumType.values);
      default:
        throw new Error('Enum can only be used with number or string properties!');
    }
  }

  private _createArray(def: PropertyDefinition): any[] {
    let childPropDef = Object.assign({}, def);
    let length: number;

    let min, max;
    if (typeof def.min === 'number') min = def.min;
    if (typeof def.max === 'number') max = def.max;
    if (typeof min !== typeof max) throw new Error('Must use both min/max or neither with Collections!');

    length = this._rand.nextInt(min, max);
    childPropDef.min = null;
    childPropDef.max = null;
    
    if (childPropDef.secondaryType instanceof StoredEnum) {
      childPropDef.type = EnumType;
    } else {
      childPropDef.type = childPropDef.secondaryType;
      childPropDef.secondaryType = null;
    }
    return Array(length).fill(0).map(() => this._createProp(childPropDef));
  }
}