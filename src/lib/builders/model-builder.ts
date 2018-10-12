import { ModelDefinition } from '../models/model-definition';
import { PropertyBuilder } from './property-builder';
import { setModelDef, getPrimaryKey, getModelDef } from '../utils/meta-reader';
import { Constructor, GeneratedConstructor } from '../models/types';

export class ModelBuilder<T=any> {

  private _modelDefinition: ModelDefinition<T>;

  public get name(): string {
    return this._modelDefinition.name;
  }

  public set name(value: string) {
    this._modelDefinition.name = value;
  }

  constructor(modelDefinition: ModelDefinition<T>) {
    this._modelDefinition = modelDefinition;
    this._modelDefinition.props = this._modelDefinition.props || {};
  }

  public static build<T=any>(modelBuilder: ModelBuilder<T>): ModelDefinition<T> {
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
    return this.prop(name, i => {
      i['_definition'].key = true;
      return cb(i);
    });
  }

  public ref<T, K extends keyof T>(name: string, ref: Constructor<T>, refKey?: K): this {
    let foreignKey = refKey || getPrimaryKey(ref);
    return this.prop(name, x => x.ref<T, K>(ref, foreignKey as any));
  }

  public inherits<T=any>(model: Constructor<T>): this {    
    this._modelDefinition.inherits = model;
    return this;
  }

  public child<T=any>(id: string, typeName: string, buildChild: (mb: ModelBuilder<T>) => ModelBuilder<T>): this {
    let childModel = new ModelBuilder({ name: typeName });
    let ChildType = buildChild(childModel).build();
    this.prop(id, c => c.type(ChildType));
    return this;
  }

  public build(): GeneratedConstructor<T> {
    this._modelDefinition.props
    let modelDef = ModelBuilder.build<T>(this);

    let keys = Object.keys(modelDef.props).map(p => modelDef.props[p]).filter(propDef => propDef.key);
    if (keys.length > 1) {
      throw new Error(`Only one property can be marked as a key!`);
    }
    if (keys.length === 1) {
      modelDef.primaryKey = keys[0].name;
    }

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