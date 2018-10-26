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
    this._modelDefinition.propList = this._modelDefinition.propList || [];
    this._modelDefinition.nativeDefinitions = this._modelDefinition.nativeDefinitions || {};
  }

  public static build<T=any>(modelBuilder: ModelBuilder<T>): ModelDefinition<T> {
    let modelDef: ModelDefinition = modelBuilder._modelDefinition;
    let BaseType: Constructor;
    if (modelBuilder._modelDefinition.inherits) {
      BaseType = modelBuilder._modelDefinition.inherits;
      const parentModelDef = getModelDef(BaseType);
      modelDef = Object.assign({}, parentModelDef, modelBuilder._modelDefinition);
      
      modelDef.props = Object.assign({}, parentModelDef.props, modelBuilder._modelDefinition.props);
      modelDef.propList = [...parentModelDef.propList, ...modelBuilder._modelDefinition.propList];
      modelDef.nativeDefinitions = Object.assign({}, parentModelDef.nativeDefinitions, modelBuilder._modelDefinition.nativeDefinitions);
    } else {
      modelDef = Object.assign({}, modelBuilder._modelDefinition);
      modelDef.props = Object.assign({}, modelBuilder._modelDefinition.props);
      modelDef.propList = [...modelBuilder._modelDefinition.propList];
      modelDef.nativeDefinitions = Object.assign({}, modelBuilder._modelDefinition.nativeDefinitions);
    }

    let keys = Object.keys(modelDef.props).map(p => modelDef.props[p]).filter(propDef => propDef.key);
    if (keys.length > 1) {
      throw new Error(`Only one property can be marked as a key!`);
    }
    if (keys.length === 1) {
      modelDef.primaryKey = keys[0].name;
    }

    return modelDef;
  }

  public prop(name: Extract<keyof T, string>, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    let propDef = this._modelDefinition.props[name];
    if (!propDef) {
      this._addToPropList(name);
      propDef = { name };
    }
    this._modelDefinition.props[name] = PropertyBuilder.build(cb(new PropertyBuilder(propDef)));

    return this;
  }

  public key(name: Extract<keyof T, string>, cb: (propBuilder: PropertyBuilder) => PropertyBuilder): this {
    this._modelDefinition.primaryKey = name;
    return this.prop(name, i => {
      i['_definition'].key = true;
      return cb(i);
    });
  }

  public ref<K extends Extract<keyof T, string>>(name: Extract<keyof T, string>, ref: Constructor<T>, refKey?: K): this {
    let foreignKey = refKey || getPrimaryKey<K>(ref) as Extract<keyof T, string>;
    return this.prop(name, x => x.ref(ref, foreignKey));
  }

  public inherits<T=any>(model: Constructor<T>): this {
    this._modelDefinition.inherits = model;
    return this;
  }
  
  public getter(name: Extract<keyof T, string>, getterFn: (this: T) => any): this {
    let nativeDef = this._modelDefinition.nativeDefinitions[name] || {};
    nativeDef.get = getterFn;
    this._modelDefinition.nativeDefinitions[name] = nativeDef;
    return this;
  }

  public setter(name: Extract<keyof T, string>, setterFn: (this: T, value: any) => void): this {
    let nativeDef = this._modelDefinition.nativeDefinitions[name] || {};
    nativeDef.set = setterFn;
    this._modelDefinition.nativeDefinitions[name] = nativeDef;
    return this;
  }

  public func(name: string, func: (...args: any[]) => any): this {
    let nativeDef = this._modelDefinition.nativeDefinitions[name] || {};
    nativeDef.value = func;
    nativeDef.enumerable = false;
    this._modelDefinition.nativeDefinitions[name] = nativeDef;
    return this;
  }

  public build(): GeneratedConstructor<T> {
    
    let modelDef = ModelBuilder.build<T>(this);

    const Type = (new Function(`"use strict";return (function ${this.name}(props){Object.assign(this, props);})`)()) as GeneratedConstructor<T>;
    setModelDef(Type, modelDef);

    if (this._modelDefinition.inherits) {
      Type.prototype = Object.create(this._modelDefinition.inherits.prototype);
      Type.prototype.constructor = Type;
    }

    // Assign getters and setters...
    Object.defineProperties(Type.prototype, modelDef.nativeDefinitions);
    
    return Type;
  }

  public toString(): string;
  public toString(toStringFn: () => string): this;
  public toString(toStringFn?: () => string): this|string {
    if (toStringFn) {
      return this.func('toString', toStringFn);
    } else {
      return `ModelBuilder<${this.name}>`;
    }
  }

  private _addToPropList(propName: string): void {
    let temp = this._modelDefinition.propList.filter(v => v !== propName);
    temp.push(propName);
    this._modelDefinition.propList = temp;
  }
}

export function StaticCreate(name: string) {
  return new ModelBuilder({ name });
}