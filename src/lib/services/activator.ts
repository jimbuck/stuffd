import { Lookup, Constructor, GuidType, GeneratedConstructor } from '../models/types';
import { StoredEnum } from '../models/stored-enum';
import { PropertyDefinition } from '../models/property-definition';
import { ModelDefinition } from '../models/model-definition';
import { getModelDef } from '../utils/meta-reader';
import { Random } from '../utils/random';
import { ListBucket } from '../models/list-bucket';
import { Model } from '../..';
import { isStoredEnum } from '../utils/type-guards';

export class Activator {

  private _rand: Random;
  private _data: ListBucket;
  private _types: Lookup<GeneratedConstructor>;

  constructor(seed?: number) {
    this._data = new ListBucket();
    this._types = {};
    this._rand = new Random(seed);
  }

  public get seed() {
    return this._rand.seed;
  }

  public create<T>(Type: Constructor<T>, count: number | Lookup<any>, constants: Lookup<any>, refs: ListBucket): T[];
  public create<T>(Type: Constructor<T>, crossed: Array<Lookup<any>>, constants: Lookup<any>, refs: ListBucket): T[];
  public create<T>(Type: Constructor<T>, countOrCrossed: number|Array<Lookup<any>>, constants: Lookup<any>, refs: ListBucket): T[] {
    
    let modelDef = getModelDef(Type);

    if (!modelDef) {
      throw new Error(`No model definition found for ${Type.name}`);
    }

    if (typeof countOrCrossed === 'number') {
      let count = Math.floor(countOrCrossed);
      if (count < 1) {
        throw new Error(`Count must be greater than zero when generating entites!`);
      }

      let results = Array(count).fill(0).map(() => this._createModel(Type as Constructor<T>, modelDef, constants, refs));
      this._types[modelDef.name] = Type;
      return this._data.add(modelDef.name, results);
    } else {
      let crossed = countOrCrossed;
      let results = crossed.map(cross => this._createModel(Type as Constructor<T>, modelDef, Object.assign({}, cross, constants), refs));
      this._types[modelDef.name] = Type;
      return this._data.add(modelDef.name, results);
    }
  }

  public get data() {
    return this._data;
  }

  public get types() {
    return this._types;
  }

  public clear() {
    this._data.clear();
    this._types = {};
  }

  private _createModel<T>(Type: Constructor<T>, modelDef: ModelDefinition, constants: Lookup<any>, refs: ListBucket): T {
    let target: any = new Type();
    for (let prop in modelDef.props) {
      let propDef = modelDef.props[prop];
      if (typeof propDef.optional === 'number' && !this._rand.nextBoolean(propDef.optional)) continue;

      target[prop] = this._createProp(propDef, refs);
    }
    Object.assign(target, constants);
    return target;
  }

  private _createProp(def: PropertyDefinition, refs: ListBucket): any {
    if (typeof def.pick !== 'undefined') {
      let choices = def.pick;
      if (typeof choices === 'function') choices = choices();
      return this._rand.choice(choices);
    }

    if (def.custom) {
      return this._rand.chance(def.custom);
    }

    if (def.ref) {
      // let availableRefs = refs.get(def.name);
      // if(!availableRefs || availableRefs.length === 0) availableRefs = this._types[def.ref.name]
      // let item = this._rand.choice()
      // return return item[def.foreignKey];
      return '<TODO>';
    }

    if (def.type instanceof StoredEnum) {
      return this._createEnum(def.type, def.designType);
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
        return this._createGuid();
      case Array:
        return this._createArray(def);
      default:
        // Complex object...
        return this.create(def.type as Constructor, 1, {}, new ListBucket())[0];
    }
  }

  private _createNumber(def: PropertyDefinition): number {
    let min, max;
    if (typeof def.min === 'number') min = def.min;
    if (typeof def.max === 'number') max = def.max;
    if (typeof min !== typeof max) throw new Error('Must use both min/max or neither with numbers!');

    if (typeof def.decimals === 'number' && def.decimals === 0) {
      if (typeof min !== 'number') {
        min = Model.defaults.minInteger;
        max = Model.defaults.maxInteger;
      }
      return this._rand.nextInt(min, max);
    }

    if (typeof min !== 'number') {
      min = Model.defaults.minFloat;
      max = Model.defaults.maxFloat;
    }
    let decimals = def.decimals || Model.defaults.maxFloatDecimals;
    return this._rand.nextFloat(min, max, decimals);
  }

  private _createGuid() {
    return this._rand.nextGuid();
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
      min = Model.defaults.minStringLength;
      max = Model.defaults.maxStringLength;
    }

    let length = this._rand.nextInt(min, max);
    return this._rand.nextString(length);
  }

  private _createEnum(EnumType: StoredEnum, designType: typeof String | typeof Number): any {
    switch (designType) {
      case String:
        return this._rand.choice(EnumType.names);
      case Number:
        return this._rand.choice(EnumType.values);
      default:
        throw new Error('Enum can only be used with number or string properties!');
    }
  }

  private _createArray(def: PropertyDefinition): any[] {
    let length: number;

    let min, max;
    if (typeof def.min === 'number') min = def.min;
    if (typeof def.max === 'number') max = def.max;
    if (typeof min !== typeof max) throw new Error('Must use both min/max or neither with Lists!');
    if (typeof min !== 'number') {
      min = Model.defaults.minArrayLength;
      max = Model.defaults.maxArrayLength;
    }

    length = this._rand.nextInt(min, max);

    let createItem: () => any;
    if (def.secondaryType === GuidType) {
      createItem = (() => this._createGuid());
    } else if (isStoredEnum(def.secondaryType)) {
      createItem = (() => this._createEnum(def.secondaryType as StoredEnum, Number));
    } else {
      let childPropDef = getModelDef(def.secondaryType);
      createItem = (() => this._createModel(def.secondaryType as Constructor, childPropDef, {}, new ListBucket()));
    }

    return Array(length).fill(0).map(createItem);
  }
}