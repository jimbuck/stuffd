
import { ModelCache } from '../models/model-cache';
import { Type } from '../models/types';
import { ModelDefinition } from '../models/model-definition';
import { PropertyDefinition } from '../models/property-definition';

import { Property } from './property';

export class Model {

  public get id(): string {
    return this._modelDefinition.id;
  }

  constructor(private _modelBuilderCache: ModelCache, private _modelDefinition: ModelDefinition) {
    this._modelDefinition.properties = this._modelDefinition.properties || {};
  }

  public name(name: string): this {
    this._modelDefinition.name = name;
    return this;
  }

  public prop(id: string, cb: (propBuilder: Property) => Property): this {
    let propDef = this._modelDefinition.properties[id] || { id };
    this._modelDefinition.properties[id] = cb(new Property(propDef)).build();

    return this;
  }

  public key(id: string, cb: (propBuilder: Property) => Property): this {
    return this.prop(id, i => cb(i.key()));
  }

  public ref(id: string, type: Type): this {
    return this.prop(id, x => x.ref(type));
  }

  public inherits<TParent>(model: string | Model): this {
    let originalId: string;
    if (typeof model === 'string') {
      originalId = model;
      model = this._modelBuilderCache.get(model);
    } else if (!this._modelBuilderCache.has(model)) {
      throw new Error(`Specified model (${model.id}) does not exist in context!`);
    }

    if (!model) {
      throw new Error(`Unknown model specified: '${originalId}''!`);
    }
    
    this._modelDefinition.inherits = model;
    return this;
  }

  public build(): ModelDefinition {
    if (this._modelDefinition.inherits) {
      const parentDef = this._modelDefinition.inherits.build();
      const thisDef = Object.assign({}, this._modelDefinition);
      
      thisDef.properties = Object.assign({}, parentDef.properties, thisDef.properties);
      
      return thisDef;
    } else {
      return Object.assign({}, this._modelDefinition);
    }
  }
}