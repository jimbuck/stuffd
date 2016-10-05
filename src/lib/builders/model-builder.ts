
import { Lookup } from '../models/lookup';
import { ModelDefinition } from '../models/model-definition';
import { PropertyDefinition } from '../models/property-definition';

import { PropertyBuilder } from './property-builder';

export class ModelBuilder {

  private _modelDefinition: ModelDefinition;

  constructor(private _modelBuilderCache: Lookup<ModelBuilder>, modelDef: ModelDefinition) {
    this._modelDefinition = modelDef;
    this._modelDefinition.properties = this._modelDefinition.properties || {};
  }

  public name(name: string): this {
    this._modelDefinition.name = name;
    return this;
  }

  public abstract(): this {
    this._modelDefinition.abstract = true;
    return this;
  }

  public inherits<TParent>(id: string|ModelBuilder): this {
    let originalId: string;
    if (typeof id === 'string') {
      originalId = id;
      id = this._modelBuilderCache.get(id);
    } else if(!this._modelBuilderCache.has(id)) {
      throw new Error(`Specified model does not exist in context!`);      
    }

    if (!id) {
      throw new Error(`Unknown model specified: '${originalId || id}''!`);
    }
    
    this._modelDefinition.inherits = id;
    return this;
  }

  public prop(id: string, cb?: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    let propDef = this._modelDefinition.properties[id] || { id };
    this._modelDefinition.properties[id] = cb(new PropertyBuilder(propDef)).build();

    return this;
  }

  public build(): ModelDefinition {
  // TODO: Fix this...

    if (this._modelDefinition.inherits) {
      return Object.assign({}, this._modelDefinition.inherits.build(), this._modelDefinition);
    } else {
      return Object.assign({}, this._modelDefinition);
    }
  }
}