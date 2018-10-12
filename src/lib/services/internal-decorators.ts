import { getDesignType, setModelDef, getModelBuilder, setModelBuilder } from '../utils/meta-reader';
import { ModelBuilder } from '../builders/model-builder';
import { PropertyBuilder } from '../builders/property-builder';

// Class Decorator
export function ModelDecorator(name?: string): ClassDecorator {
  return function (Target: any) {
    name = name || Target.name;
    let modelBuilder = getModelBuilder(Target);
    modelBuilder.name = name;

    const modelDef = ModelBuilder.build(modelBuilder);
    setModelDef(Target, modelDef);

    return Target;
  }
}

// Property Decorator
export function PropDecorator(act?: (mb: PropertyBuilder) => PropertyBuilder): PropertyDecorator {

  return function (target: any, prop: string) {
    const designType = getDesignType(target, prop);
    let modelBuilder = getModelBuilder(target.constructor);

    let propDef = modelBuilder['_modelDefinition'].props[prop] || {};

    propDef.designType = designType;
    if (!propDef.type) {
      propDef.type = designType;
    }

    modelBuilder['_modelDefinition'].props[prop] = propDef;

    act && modelBuilder.prop(prop, act);

    setModelBuilder(target.constructor, modelBuilder);
  }
}