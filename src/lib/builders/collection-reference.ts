import { ModelDefinition } from '../models/model-definition';
import { Lookup } from '../models/dictionary';
import { Activator } from '../services/activator';

export type GeneratedArray<T=any> = Array<T> & { _baseCollection: CollectionReference };

export class CollectionReference {

  private _modelDef: ModelDefinition;
  private _count: number;
  private _consts: Lookup<any>;
  private _crossLeft: CollectionReference;
  private _crossRight: CollectionReference;

  private _explicitRefs: Lookup<CollectionReference>;
  private _generalRefs: Lookup<CollectionReference>;

  private _result: GeneratedArray;

  private _activator: Activator;

  constructor(activator: Activator, modelDef: ModelDefinition, count?: number, constants?: Lookup<any>) {
    this._activator = activator;
    this._modelDef = modelDef;
    this._count = count;
    this._consts = constants;
  }

  public using(collectionRef: GeneratedArray | CollectionReference, propName?: string): this {
    collectionRef = _getCollectionRef(collectionRef);
    if (propName) {
      this._explicitRefs[propName] = collectionRef;
    } else {
      this._generalRefs[collectionRef._modelDef.id] = collectionRef;
    }

    return this;
  }

  public cross(leftRef: GeneratedArray | CollectionReference, rightRef: GeneratedArray | CollectionReference): this {
    this._crossLeft = _getCollectionRef(leftRef);
    this._crossRight = _getCollectionRef(rightRef);

    if (!this._crossLeft || !this._crossRight) throw new Error(`Both 'leftRef' and 'rightRef' must be provided when crossing values!`);
    
    return this;
  }

  public toArray<T=any>(): GeneratedArray<T> {
    if (this._result && this._result.length > 0) return this._result;

    if (this._crossLeft || this._crossRight) {
      let leftData = this._crossLeft.toArray();
      let rightData = this._crossRight.toArray();
      let result = [];
      
      for (let left of leftData) {
        for (let right of rightData) {
          let consts = Object.assign({}, this._consts, {
            
          });
          let item = this._activator.create<T>(this._modelDef, 1, this._consts);
          result.push(item);
        }
      }
      this._result = this._createGeneratedArray(result);
    } else if(this._count > 0) {
      this._result = this._createGeneratedArray(this._activator.create<T>(this._modelDef, this._count, this._consts));
    } else {
      throw new Error(`No count or left/right cross values were found!`);
    }

    return this._result;
  }

  private _createGeneratedArray<T>(data: T[]): GeneratedArray<T> {
    return Object.assign(data, { _baseCollection: this });
  }
}

function _getCollectionRef(val: GeneratedArray | CollectionReference): CollectionReference {
  return Array.isArray(val) ? val._baseCollection : val;
}