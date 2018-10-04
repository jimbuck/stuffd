import { StuffMetadata, TypeDefinition } from '../models/types';
import { PropertyDefinition } from '../models/property-definition';

const stuffMetaKey = Symbol('jimmyboh:stuff:meta');

interface StuffDecorator {
    (): Function;
    create<T>(): T;
    create<T>(count: number): T[];
}

// Class Decorator
export const Stuff: StuffDecorator = Object.assign(function () {
    return function (Target: any) {
        return function (...args: any[]) {
            let instance = new Target(...args);

            let meta = instance[stuffMetaKey];
    
            if (meta) {
                for (let prop in meta) {
                    instance[prop] = instance[prop] || meta[prop]();
                }
            }

            return instance;
        } as any;
    }
}, {
        create<T>(count: number = 1): T | T[] {
            if (typeof count === 'number') {
                let results: T[] = [];
    
                return results;
            } else {
                return null;
            }
        }
    });

// Property Decorator
export function Prop(def?: PropertyDefinition) {
    def = def || {};

    return function (target: any, prop: string) {
        debugger;
        //_propRegistry[target.constructor] = _propRegistry[target.constructor] || [];
        //_propRegistry[target.constructor].push(prop);
                
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