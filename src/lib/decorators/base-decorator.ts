import { Lookup } from '../models/dictionary';
import { StuffMetadata } from '../models/types';
import { PropertyDefinition } from '../models/property-definition';

export const _propRegistry: Lookup<string[]> = {};

export function Stuff(def?: PropertyDefinition) {
    def = def || {};

    return function (target: any, prop: string) {
        _propRegistry[target.constructor] = _propRegistry[target.constructor] || [];
        _propRegistry[target.constructor].push(prop);
                
        let prevOpts = Reflect.getMetadata(StuffMetadata, target, prop);

        if (prevOpts) {
            def = Object.assign(prevOpts, def);
        }

        if (!def.type) {
            def.type = Reflect.getMetadata(StuffMetadata, target, prop) || target[prop].constructor;
        }

        return Reflect.defineMetadata(StuffMetadata, def, target, prop);
    }
}