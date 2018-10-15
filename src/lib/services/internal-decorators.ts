import { getDesignType, setModelDef, getModelBuilder, setModelBuilder } from '../utils/meta-reader';
import { ModelBuilder } from '../builders/model-builder';
import { PropertyBuilder } from '../builders/property-builder';
import { Constructor } from '../models/types';

// Class Decorator
export function ModelDecorator(): ClassDecorator {
  return function (Target: any) {
    let modelBuilder = getModelBuilder(Target);
    modelBuilder.name = Target.name;

    const modelDef = ModelBuilder.build(modelBuilder);
    setModelDef(Target, modelDef);

    return Target;
  }
}

// Property Decorator
export function PropDecorator(act?: (mb: PropertyBuilder, designType: Constructor) => PropertyBuilder): PropertyDecorator {
  act = act || (p => p);
  return function (target: any, prop: string) {
    const designType = getDesignType(target, prop);
    let modelBuilder = getModelBuilder(target.constructor);

    let propDef = modelBuilder['_modelDefinition'].props[prop] || {};
    
    propDef.name = propDef.name || prop;
    propDef.designType = designType;
    if (!propDef.type) {
      propDef.type = designType;
    }

    modelBuilder['_modelDefinition'].props[prop] = propDef;
    modelBuilder.prop(prop, p => act(p, designType));

    setModelBuilder(target.constructor, modelBuilder);
  }
}