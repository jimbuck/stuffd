import { ModelDefinition } from '../models/model-definition';
import { PropertyBuilder } from './property-builder';
import { setModelDef, getPrimaryKey, getModelDef } from '../utils/meta-reader';
import { Constructor, GeneratedConstructor } from '../models/types';

export class ModelBuilder {

  private _modelDefinition: ModelDefinition;

  public get name(): string {
    return this._modelDefinition.name;
  }

  public set name(value: string) {
    this._modelDefinition.name = value;
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

  public prop(name: string, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    let propDef = this._modelDefinition.props[name] || { name };
    this._modelDefinition.props[name] = PropertyBuilder.build(cb(new PropertyBuilder(propDef)));

    return this;
  }

  public key(name: string, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    this._modelDefinition.primaryKey = name;
    return this.prop(name, i => cb(i.key()));
  }

  public ref(name: string, ref: Constructor, refKey?: string): this {
    let foreignKey = refKey || getPrimaryKey(ref);
    return this.prop(name, x => x.ref<any, string>(ref, foreignKey));
  }

  public inherits<T=any>(model: Constructor<T>): this {    
    this._modelDefinition.inherits = model;
    return this;
  }

  public child(id: string, typeName: string, buildChild: (mb: ModelBuilder) => ModelBuilder): this {
    let childModel = new ModelBuilder({ name: typeName });
    let ChildType = buildChild(childModel).build();
    this.prop(id, c => c.type(ChildType));
    return this;
  }

  public build<T=any>(): GeneratedConstructor<T> {
    let modelDef = ModelBuilder.build(this);

    const Type = (new Function(`"use strict";return (function ${this.name}(props){Object.assign(this, props);})`)()) as GeneratedConstructor<T>;
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
      return `ModelBuilder<${this.name}>`;
    }
  }
}

export function StaticCreate(name: string) {
  return new ModelBuilder({ name });
}