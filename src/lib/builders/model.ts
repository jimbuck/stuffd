
import { Type } from '../models/types';
import { ModelDefinition } from '../models/model-definition';
import { PropertyDefinition } from '../models/property-definition';
import { Dictionary } from '../models/dictionary';

import { Property } from './property';

export class Model {

  public get id(): string {
    return this._modelDefinition.id;
  }

  constructor(private _modelDefinition: ModelDefinition) {
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

  public inherits<TParent>(model: Model): this {    
    this._modelDefinition.inherits = model;
    return this;
  }

  public toString(): string {
    return this.id;
  }

  private _build(): ModelDefinition {
    if (this._modelDefinition.inherits) {
      const parentDef = this._modelDefinition.inherits._build();
      const thisDef = Object.assign({}, this._modelDefinition);
      
      thisDef.properties = Object.assign({}, parentDef.properties, thisDef.properties);
      
      return thisDef;
    } else {
      return Object.assign({}, this._modelDefinition);
    }
  }
}