
import { Dictionary, Lookup } from '../models/dictionary';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from './model-builder';
import { Activator } from '../services/activator';
import { Constructor } from '../models/types';
import { CollectionReference, GeneratedArray } from './collection-reference';

export class Context {

    private _modelCache: Dictionary<ModelBuilder>;
    private _activator: Activator;
    private _data: Lookup<any[]> = {};

    constructor(seed?: number) {
        this._activator = new Activator(seed);
        this._modelCache = new Dictionary<ModelBuilder>();
    }

    public get seed() {
        return this._activator.seed;
    }

    public model(id: string): ModelBuilder {

        if (this._modelCache.hasKey(id)) {
            throw new Error(`Model '${id}' has already been defined!'`);  
        }

        return this._modelCache.set(id, new ModelBuilder({ id }));
    }

    public create<T>(Type: Constructor<T>, count: number, constants?: Lookup<any>): GeneratedArray<T>;
    public create<T>(Type: ModelBuilder, count: number, constants?: Lookup<any>): GeneratedArray<T>;
    public create<T>(Type: Constructor<T> | ModelBuilder, count: number, constants: Lookup<any> = {}): GeneratedArray<T> {
        return new CollectionReference(this._activator).create<T>(Type, count, constants);
    }

    public using(data: Lookup<GeneratedArray>) {
        return new CollectionReference(this._activator).using(data);
    }

    public cross(data: Lookup<GeneratedArray>) {
        return new CollectionReference(this._activator).cross(data);
    }

    public clear(): void {
        this._data = {};
    }

    public data(): Lookup<any> {
        return Object.assign({}, this._data);
    }

    public toString(): string {
        return `Context (seed: ${this.seed})`;
    }

    private _build(): Lookup<ModelDefinition> {
        let modelDefinitions: Lookup<ModelDefinition> = {};
        this._modelCache.forEach((mb, id) => {
            const baseModel = mb['_modelDefinition'].inherits;
            if (baseModel && !this._modelCache.hasKey(baseModel.id)) {
                throw new Error(`Specified model (${baseModel.id}) does not exist in this context!`);
            }

            modelDefinitions[id] = ModelBuilder.build(mb);
        });

        return modelDefinitions;
    }
}