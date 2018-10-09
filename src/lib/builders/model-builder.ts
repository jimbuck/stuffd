import { ModelDefinition } from '../models/model-definition';
import { PropertyBuilder } from './property-builder';

export class ModelBuilder {

  private _modelDefinition: ModelDefinition;

  public static build(mb: ModelBuilder): ModelDefinition {
    return mb._build();
  }

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

  public prop(id: string, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    let propDef = this._modelDefinition.props[id] || { id };
    this._modelDefinition.props[id] = cb(new PropertyBuilder(propDef)).build();

    return this;
  }

  public key(id: string, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    this._modelDefinition.primaryKey = id;
    return this.prop(id, i => cb(i.key()));
  }

  public ref(id: string, type: ModelBuilder, foreignKey?: string): this {
    foreignKey = foreignKey || this._modelDefinition.primaryKey;
    return this.prop(id, x => x.ref(type, foreignKey));
  }

  public inherits(model: ModelBuilder): this {    
    this._modelDefinition.inherits = model;
    return this;
  }

  public toString(): string {
    return this.id;
  }

  private _build(): ModelDefinition {
    if (this._modelDefinition.inherits) {
      const parentModelDef = this._modelDefinition.inherits._build();
      const thisDef = Object.assign({}, parentModelDef, this._modelDefinition);
      
      thisDef.props = Object.assign({}, parentModelDef.props, this._modelDefinition.props);
      thisDef.inherits = this._modelDefinition.inherits;
      return thisDef;
    } else {
      return Object.assign({}, this._modelDefinition);
    }
  }
}