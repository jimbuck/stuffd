import { ListBucket } from '../models/list-bucket';
import { Activator } from '../services/activator';
import { Lookup, Constructor, GeneratedArray } from '../models/types';
import { crossProps } from '../utils/extensions';
import { getPrimaryKey } from '../utils/meta-reader';

export class CollectionBuilder {

  private _explicitRefs: ListBucket;
  private _crossRefs: Lookup<GeneratedArray>;

  private _activator: Activator;

  constructor(activator: Activator) {
    this._activator = activator;
    this._explicitRefs = new ListBucket();
  }

  public using(data: Lookup<GeneratedArray>): this {
    
    Object.keys(data).forEach(prop => {
      this._explicitRefs.add(prop, data[prop]);
    });

    return this;
  }

  public cross(data: Lookup<GeneratedArray>): this {
    if (this._crossRefs) throw new Error(`'cross()' can only be used once for a collection!`);
    
    this._crossRefs = data;

    return this;
  }

  public create<T=any>(Type: Constructor<T>, constants?: Lookup<any>): GeneratedArray<T>
  public create<T=any>(Type: Constructor<T>, count: number, constants?: Lookup<any>): GeneratedArray<T>
  public create<T=any>(Type: Constructor<T>, count?: number | Lookup<any>, constants?: Lookup<any>): GeneratedArray<T> {
    if (typeof count !== 'number') {
      constants = count;
      count = 0;
    }

    if (this._crossRefs && Object.keys(this._crossRefs).length > 0) {
      let crossedProps = this._crossProps();
      let result = this._activator.create<T>(Type, crossedProps, constants);
      return result;
    } else if(count > 0) {
      let result = this._activator.create<T>(Type, count, constants);
      return result;
    } else {
      throw new Error(`Must provide a count or cross against existing data!`);
    }
  }

  private _crossProps() {
    let keys: Lookup<any> = {};

    Object.keys(this._crossRefs).forEach(prop => {
      let generatedInstance = this._crossRefs[prop].find(item => !!getPrimaryKey(item.constructor));
      let primaryKey = generatedInstance && getPrimaryKey(generatedInstance.constructor);
      if (!primaryKey) throw new Error(`Cannot determine primary key of ${(generatedInstance || {}).constructor || prop}! (make sure at least one item was generated by the Context)`);
      keys[prop] = this._crossRefs[prop].map(ref => ref[primaryKey]);
    });

    return crossProps(keys);
  }
}