
import { Lookup, ILookup } from '../models/lookup';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from './model-builder';

export class ContextBuilder {

  private _modelBuilderCache: Lookup<ModelBuilder>;

  constructor() {
    this._modelBuilderCache = new Lookup<ModelBuilder>();
  }

  public model(id: string): ModelBuilder {
    
    return this._modelBuilderCache.getOrAdd(id, () => new ModelBuilder(this._modelBuilderCache, { id }));
  }

  public delete<TModel>(id: string | ModelBuilder) {
    if (typeof id !== 'string') {
      // Convert ModelBuilder into a string...
      id = this._modelBuilderCache.findKey(mb => mb === id);
    }

    if (id) {
      this._modelBuilderCache.delete(id);
    }
  }

  public build(): ILookup<ModelDefinition> {
    let result: ILookup<ModelDefinition> = {};
    this._modelBuilderCache.forEach((mb, id) => {
      result[id] = mb.build();
    });

    return result;
  }
}