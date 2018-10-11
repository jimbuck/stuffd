import { getDesignType, setModelDef, getModelBuilder, setModelBuilder } from '../utils/meta-reader';
import { ModelBuilder } from '../builders/model-builder';
import { PropertyBuilder } from '../builders/property-builder';

// Class Decorator
export function ModelDecorator(id?: string): ClassDecorator {
  return function (Target: any) {
    id = id || Target.name;
    let modelBuilder = getModelBuilder(Target);
    modelBuilder.id = id;

    const modelDef = ModelBuilder.build(modelBuilder);
    setModelDef(Target, modelDef);

    return Target;
  }
}

// Property Decorator
export function PropDecorator(act: (mb: PropertyBuilder) => PropertyBuilder): PropertyDecorator {

  return function (target: any, prop: string) {
    const designType = getDesignType(target, prop);
    let modelBuilder = getModelBuilder(target.constructor);

    modelBuilder['_modelDefinition'].props[prop] = modelBuilder['_modelDefinition'].props[prop] || {};

    modelBuilder['_modelDefinition'].props[prop].designType = designType;
    if (!modelBuilder['_modelDefinition'].props[prop].type) modelBuilder['_modelDefinition'].props[prop].type = designType;

    modelBuilder.prop(prop, act);

    setModelBuilder(target.constructor, modelBuilder);
  }
}