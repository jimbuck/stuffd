
import { Dictionary, Lookup } from '../models/dictionary';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from './model-builder';
import { ExecutionContext } from './execution-context';
import { Activator } from '../services/activator';
import { Constructor } from '../models/types';

export type TaskAction = (x: ExecutionContext) => void | Promise<void>;

export class Context {

    private _modelCache: Dictionary<ModelBuilder>;

    private _activator: Activator;

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

    public async run(actions: TaskAction): Promise<void> {
        let modelDefinitions = this._build();
        let tBuilder = new ExecutionContext(modelDefinitions, this._activator);

        await actions(tBuilder);        
    }

    public create<T>(Type: Constructor<T>, count: number, constants?: Lookup<any>): T[];
    public create<T>(Type: ModelBuilder, count: number, constants?: Lookup<any>): T[];
    public create<T>(Type: Constructor<T> | ModelBuilder, count: number, constants: Lookup<any> = {}): T[] {
        return this._activator.create<T>(Type as any, count, constants);
    }

    public reset(): void {
        
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