import { ModelDefinition } from '../models/model-definition';
import { Lookup } from '../models/dictionary';
import { Activator } from '../services/activator';
import { ModelBuilder } from './model-builder';
import { Constructor } from '../models/types';

export type GeneratedArray<T=any> = Array<T> & { _baseCollection?: CollectionReference };

export class CollectionReference {

  private _explicitRefs: Lookup<GeneratedArray>;
  private _crossRefs: Lookup<GeneratedArray>;

  private _result: GeneratedArray;

  private _activator: Activator;

  constructor(activator: Activator) {
    this._activator = activator;
  }

  public using(data: Lookup<GeneratedArray>): this {
    
    Object.keys(data).forEach(prop => {
      let set = this._explicitRefs[prop] || [];
      set = set.concat(data[prop]);
      this._explicitRefs[prop] = set;
    });

    return this;
  }

  public cross(data: Lookup<GeneratedArray>): this {
    this._crossRefs = data;

    return this;
  }

  public create<T=any>(modelBuilder: Constructor<T> | ModelBuilder, count?: number, constants?: Lookup<any>): GeneratedArray<T> {
    
    let crossedPropKeys = Object.keys(this._crossRefs);
    if (crossedPropKeys.length > 0) {
      let crossedProps = _crossProps(this._crossRefs);
      // TODO: Loop through each crossed prop...
    } else if(count > 0) {
      this._result = this._createGeneratedArray(this._activator.create<T>(modelBuilder as any, count, constants));
    } else {
      throw new Error(`No count or left/right cross values were found!`);
    }

    return this._result;
  }

  private _createGeneratedArray<T>(data: T[]): GeneratedArray<T> {
    return Object.assign(data, { _baseCollection: this });
  }
}

function _crossProps(data: Lookup<any[]>) {
  let keys = Object.keys(data);
  let values = [...keys.map(key => data[key].map(value => ({ key, value })))];
  let products = _cartesian(...values);

  return products.map(product => product.reduce((obj: Lookup<any>, next: { key: string, value: any }) => Object.assign(obj, { [next.key]: next.value }), {}));
}
function _crossTwo(a: any[], b: any[]): any[][] {
  return [].concat(...a.map(aItem => b.map(bItem => [].concat(aItem, bItem))));
}
function _cartesian(...data: any[]): any[] {
  const [a, b, ...c] = data;
  return b ? _cartesian(_crossTwo(a, b), ...c) : a;
}