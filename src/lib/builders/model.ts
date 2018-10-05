
import { TypeReference } from '../models/types';
import { ModelDefinition } from '../models/model-definition';


import { Property } from './property';

export class ModelBuilder {

  private _modelDefinition: ModelDefinition;
  private _inherits: ModelBuilder;

  public get id(): string {
    return this._modelDefinition.id;
  }

  constructor(modelDefinition: ModelDefinition) {
    this._modelDefinition = modelDefinition;
    this._modelDefinition.props = this._modelDefinition.props || {};
  }

  public name(name: string): this {
    this._modelDefinition.name = name;
    return this;
  }

  public prop(id: string, cb: (propBuilder: Property) => Property): this {
    let propDef = this._modelDefinition.props[id] || { id };
    this._modelDefinition.props[id] = cb(new Property(propDef)).build();

    return this;
  }

  public key(id: string, cb: (propBuilder: Property) => Property): this {
    return this.prop(id, i => cb(i.key()));
  }

  public ref(id: string, type: TypeReference): this {
    return this.prop(id, x => x.ref(type));
  }

  public inherits(model: ModelBuilder): this {    
    this._inherits = model;
    return this;
  }

  public toString(): string {
    return this.id;
  }

  private _build(): ModelDefinition {
    if (this._inherits) {
      const parentModelDef = this._inherits._build();
      const thisDef = Object.assign({}, parentModelDef, this._modelDefinition);
      
      thisDef.props = Object.assign({}, parentModelDef.props, this._modelDefinition.props);
      
      return thisDef;
    } else {
      return Object.assign({}, this._modelDefinition);
    }
  }
}