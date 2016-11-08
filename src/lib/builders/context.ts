
import { Dictionary, Lookup } from '../models/dictionary';
import { Task } from '../builders/task';
import { ModelDefinition } from '../models/model-definition';
import { Model } from './model';

export type TaskDefinition = (t: Task) => void;

export class Context {

    private _modelCache: Dictionary<Model>;
    private _taskCache: Dictionary<TaskDefinition>;

    constructor() {
        this._modelCache = new Dictionary<Model>();
        this._taskCache = new Dictionary<TaskDefinition>();
    }

    public model(id: string): Model {

        if (this._modelCache.hasKey(id)) {
            throw new Error(`Model '${id}' has already been defined!'`);  
        }

        return this._modelCache.set(id, new Model({ id }));
    }

    public task(taskName: string, task: TaskDefinition): string {
        this._taskCache.set(taskName, task);

        return taskName;
    }

    public run(taskName: string, output?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let taskDef = this._taskCache.get(taskName);

            if (!taskDef) {
                return reject(new Error(`Unknown Task: '${taskName}'!`));
            }

            let task = new Task(taskName);
            taskDef(task);

            let orders = task.build();

            // TODO: Actually implement this thing...
        });
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