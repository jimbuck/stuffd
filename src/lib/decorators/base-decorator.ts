import { ILookup } from '../models/lookup';
import { StuffDecoratorMetadata } from '../models/types';
import { PropertyDefinition } from '../models/property-definition';

export const _propRegistry: ILookup<string[]> = {};

export function Stuff(def?: PropertyDefinition) {
    def = def || {};

    return function (target: any, prop: string) {
        _propRegistry[target.constructor] = _propRegistry[target.constructor] || [];
        _propRegistry[target.constructor].push(prop);
                
        let prevOpts = Reflect.getMetadata(StuffDecoratorMetadata, target, prop);

        if (prevOpts) {
            def = Object.assign(prevOpts, def);
        }

        if (!def.type) {
            def.type = Reflect.getMetadata(StuffDecoratorMetadata, target, prop) || target[prop].constructor;
        }

        return Reflect.defineMetadata(StuffDecoratorMetadata, def, target, prop);
    }
}