import { ModelDefinition } from '../models/model-definition';
import { Lookup } from '../models/dictionary';

export class CollectionReference {

  private _modelDef: ModelDefinition;
  private _count: number;
  private _consts: Lookup<any>;
  private _crossLeft: CollectionReference;
  private _crossRight: CollectionReference;

  private _explicitRefs: Lookup<CollectionReference>;
  private _generalRefs: Lookup<CollectionReference>;

  private _result: any[];

  constructor(modelDef: ModelDefinition, count?: number, constants?: Lookup<any>) {
    this._modelDef = modelDef;
    this._count = count;
    this._consts = constants;
  }

  public using(collectionRef: CollectionReference, propName?: string): this {
    if (propName) {
      this._explicitRefs[propName] = collectionRef;
    } else {
      this._generalRefs[collectionRef._modelDef.id] = collectionRef;
    }

    return this;
  }

  public cross(leftRef: CollectionReference, rightRef: CollectionReference): this {
    this._crossLeft = leftRef;
    this._crossRight = rightRef;

    return this;
  }

  public toStream(): ReadableStream {
    return null;
  }

  public toArray<T>(): T[] {
    if (this._crossLeft || this._crossRight) {
      this._result = [];
    } else {
      this._result = Array(this._count).fill(0).map(() => this._modelDef);
    }

    return this._result;
  }
}