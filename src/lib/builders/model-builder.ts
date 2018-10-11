import { ModelDefinition } from '../models/model-definition';
import { PropertyBuilder } from './property-builder';
import { setModelDef, getPrimaryKey, getModelDef } from '../utils/meta-reader';
import { Constructor, GeneratedConstructor } from '../models/types';

export class ModelBuilder {

  private _modelDefinition: ModelDefinition;

  public get id(): string {
    return this._modelDefinition.id;
  }

  public set id(value: string) {
    this._modelDefinition.id = value;
  }

  constructor(modelDefinition: ModelDefinition) {
    this._modelDefinition = modelDefinition;
    this._modelDefinition.props = this._modelDefinition.props || {};
  }

  public static build(modelBuilder: ModelBuilder): ModelDefinition {
    let modelDef: ModelDefinition = modelBuilder._modelDefinition;
    let BaseType: Constructor;
    if (modelBuilder._modelDefinition.inherits) {
      BaseType = modelBuilder._modelDefinition.inherits;
      const parentModelDef = getModelDef(BaseType);
      modelDef = Object.assign({}, parentModelDef, modelBuilder._modelDefinition);
      
      modelDef.props = Object.assign({}, parentModelDef.props, modelBuilder._modelDefinition.props);
    } else {
      modelDef = Object.assign({}, modelBuilder._modelDefinition);
      modelDef.props = Object.assign({}, modelBuilder._modelDefinition.props);
    }

    return modelDef;
  }

  public name(name: string): this {
    this._modelDefinition.name = name;
    return this;
  }

  public prop(id: string, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    let propDef = this._modelDefinition.props[id] || { id };
    this._modelDefinition.props[id] = PropertyBuilder.build(cb(new PropertyBuilder(propDef)));

    return this;
  }

  public key(id: string, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    this._modelDefinition.primaryKey = id;
    return this.prop(id, i => cb(i.key()));
  }

  public ref(id: string, ref: Constructor, refKey?: string): this {
    let foreignKey = refKey || getPrimaryKey(ref);
    return this.prop(id, x => x.ref<any, string>(ref, foreignKey));
  }

  public inherits<T=any>(model: Constructor<T>): this {    
    this._modelDefinition.inherits = model;
    return this;
  }

  public build<T=any>(): GeneratedConstructor<T> {
    let modelDef = ModelBuilder.build(this);

    const Type = (new Function(`"use strict";return (function ${this.id}(props){Object.assign(this, props);})`)()) as GeneratedConstructor<T>;
    setModelDef(Type, modelDef);

    if (this._modelDefinition.inherits) {
      Type.prototype = Object.create(this._modelDefinition.inherits.prototype);
      Type.prototype.constructor = Type;
    }

    if (modelDef.toStringFn) {
      Type.prototype.toString = function () {
        return modelDef.toStringFn(this);
      };
    }
    
    return Type;
  }

  public toString(): string;
  public toString(toStringFn: (x:any) => string): this;
  public toString(toStringFn?: (x:any) => string): this|string {
    if (toStringFn) {
      this._modelDefinition.toStringFn = toStringFn;
      return this;
    } else {
      return `ModelBuilder<${this.id}>`;
    }
  }
}

export function StaticCreate(id: string) {
  return new ModelBuilder({ id });
}