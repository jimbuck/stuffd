
import { Dictionary, Lookup } from '../models/dictionary';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from './model-builder';
import { TaskBuilder } from './task-builder';

export class Context {

    private _modelCache: Dictionary<ModelBuilder>;

    constructor() {
        this._modelCache = new Dictionary<ModelBuilder>();
    }

    public model(id: string): ModelBuilder {

        if (this._modelCache.hasKey(id)) {
            throw new Error(`Model '${id}' has already been defined!'`);  
        }

        return this._modelCache.set(id, new ModelBuilder({ id }));
    }

    public task<T>(name: string, actions: (t: any) => T): T {
        // Build dependency graph...
        let t = new TaskBuilder();

        return actions(t);
    }

    // TODO: Make this return a ContextDefinition...?    
    private _build(): Lookup<ModelDefinition> {
        let modelDefinitions: Lookup<ModelDefinition> = {};
        this._modelCache.forEach((mb, id) => {
            const baseModel = mb['_modelDefinition'].inherits;
            if (baseModel && !this._modelCache.hasKey(baseModel.id)) {
                throw new Error(`Specified model (${baseModel.id}) does not exist in this context!`);
            }

            modelDefinitions[id] = mb['_build']();
        });

        return modelDefinitions;
    }
}