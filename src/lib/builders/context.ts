
import { Dictionary, Lookup } from '../models/dictionary';
import { ModelDefinition } from '../models/model-definition';
import { ModelBuilder } from './model-builder';
import { ExecutionContext } from './execution-context';

type TaskAction = (t: ExecutionContext) => void|Promise<void>;

export class Context {

    private _modelCache: Dictionary<ModelBuilder>;
    private _tasks: Lookup<TaskAction> = {};

    constructor() {
        this._modelCache = new Dictionary<ModelBuilder>();
    }

    public model(id: string): ModelBuilder {

        if (this._modelCache.hasKey(id)) {
            throw new Error(`Model '${id}' has already been defined!'`);  
        }

        return this._modelCache.set(id, new ModelBuilder({ id }));
    }

    public task(name: string, actions: TaskAction): void {
        this._tasks[name] = actions;
    }

    public run(name: string): Promise<void>;
    public run(actions: TaskAction): Promise<void>;
    public async run(nameOrActions: string | TaskAction): Promise<void> {
        let modelDefinitions = this._build();
        let tBuilder = new ExecutionContext(modelDefinitions);

        if (typeof nameOrActions === 'string') {
            await this._tasks[name](tBuilder);
        } else {
            await nameOrActions(tBuilder);
        }        
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