import { getDesignType, getModelDef, setModelDef } from '../services/meta-reader';
import { PropertyDefinition } from '../models/property-definition';
import { ModelBuilder } from '../builders/model-builder';

interface ModelStatic {
    (id?: string): ClassDecorator;
    create(id: string): ModelBuilder;
}

// Class Decorator
export const Model: ModelStatic = Object.assign(
    function Model(id?: string): ClassDecorator {
        return function (Target: any) {
            id = id || Target.name;
            let modelDef = getModelDef(Target);
            modelDef.id = id;

            setModelDef(Target, modelDef);

            return Target;
        }
    },
    {
        create(id?: string) {
            return new ModelBuilder({ id });
        }
    }
);

// Property Decorator
export function Prop(propDef?: PropertyDefinition): PropertyDecorator {
    propDef = propDef || {};

    return function (target: any, prop: string) {
        const type = getDesignType(target, prop);
        let modelDef = getModelDef(target.constructor);
        let prevPropDef = modelDef.props[prop] || {};

        modelDef.props[prop] = Object.assign({ type, designType: type }, prevPropDef, propDef);
        if (modelDef.props[prop].key) modelDef.primaryKey = prop;

        setModelDef(target.constructor, modelDef);
    }
}