import { Lookup } from '../models/dictionary';
import { ModelBuilder } from './model-builder';
import { ModelDefinition } from '../models/model-definition';
import { CollectionReference } from './collection-reference';

export class ExecutionContext {

  private _tasks: Array<CollectionReference> = [];
  private _modelDefs: Lookup<ModelDefinition>;

  constructor(modelDefs: Lookup<ModelDefinition>) {
    this._modelDefs = modelDefs;
  }

  public create(modelBuilder: ModelBuilder, count?: number, constants?: Lookup<any>): CollectionReference {
    let modelDef = this._modelDefs[modelBuilder.id];
    if (!modelDef) throw new Error(`Unknown model '${modelBuilder.id}'!`);
    let taskBuilder = new CollectionReference(modelDef, count, constants);
    this._tasks.push(taskBuilder);
    return taskBuilder;
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