import { Lookup } from '../models/dictionary';
import { ModelBuilder } from './model-builder';
import { ModelDefinition } from '../models/model-definition';
import { CollectionReference } from './collection-reference';
import { Activator } from '../services/activator';

export class ExecutionContext {

  private _activator: Activator;
  private _collections: Array<CollectionReference> = [];
  private _modelDefs: Lookup<ModelDefinition>;

  constructor(modelDefs: Lookup<ModelDefinition>, activator: Activator) {
    this._activator = activator;
    this._modelDefs = modelDefs;
  }

  public create(modelBuilder: ModelBuilder, count?: number, constants?: Lookup<any>): CollectionReference {
    let modelDef = this._modelDefs[modelBuilder.id];
    if (!modelDef) throw new Error(`Unknown model '${modelBuilder.id}'!`);
    let collectionRef = new CollectionReference(this._activator, modelDef, count, constants);
    this._collections.push(collectionRef);
    return collectionRef;
  }

  public toStream(): ReadableStream {
    // TODO: Create a stream of data...
    return null;
  }

  public data(): {} {
    // TODO: Generate all data into object.
    return {};
  }
}