import { Lookup, ListBucket } from '../models/dictionary';
import { Activator } from '../services/activator';
import { ModelBuilder } from './model-builder';
import { Constructor } from '../models/types';
import { crossProps } from '../utils/extensions';

export type GeneratedArray<T=any> = Array<T> & { _baseCollection?: CollectionReference };

export class CollectionReference {

  private _explicitRefs: ListBucket;
  private _crossRefs: Lookup<GeneratedArray>;

  private _result: GeneratedArray;

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

  public create<T=any>(Type: Constructor<T>, count?: number, constants?: Lookup<any>): GeneratedArray<T> {
    
    if (this._crossRefs && Object.keys(this._crossRefs).length > 0) {
      let crossedProps = crossProps(this._crossRefs);
      // TODO: Loop through each crossed prop...
    } else if(count > 0) {
      this._result = this._createGeneratedArray(this._activator.create<T>(Type, count, constants));
    } else {
      throw new Error(`Must provide a count or cross against existing data!`);
    }

    return this._result;
  }

  private _createGeneratedArray<T>(data: T[]): GeneratedArray<T> {
    return Object.assign(data, { _baseCollection: this });
  }
}