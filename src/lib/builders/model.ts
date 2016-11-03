
import { Dictionary } from '../models/dictionary';
import { Type } from '../models/types';
import { ModelDefinition } from '../models/model-definition';
import { PropertyDefinition } from '../models/property-definition';

import { Property } from './property';

export class Model {

  private _modelDefinition: ModelDefinition;

  constructor(private _modelBuilderCache: Dictionary<Model>, modelDef: ModelDefinition) {
    this._modelDefinition = modelDef;
    this._modelDefinition.properties = this._modelDefinition.properties || {};
  }

  public name(name: string): this {
    this._modelDefinition.name = name;
    return this;
  }

  public inherits<TParent>(id: string|Model): this {
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

  public build(): ModelDefinition {
  // TODO: Fix this...

    if (this._modelDefinition.inherits) {
      return Object.assign({}, this._modelDefinition.inherits.build(), this._modelDefinition);
    } else {
      return Object.assign({}, this._modelDefinition);
    }
  }
}