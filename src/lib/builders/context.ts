
import { Dictionary, Lookup } from '../models/dictionary';
import { ModelCache } from '../models/model-cache';
import { Task } from '../builders/task';
import { ModelDefinition } from '../models/model-definition';
import { Model } from './model';

export type TaskDefinition = (t: Task) => void;

export class Context {

    private _modelCache: ModelCache;
    private _taskCache: Dictionary<TaskDefinition>;

    constructor() {
        this._modelCache = new ModelCache();
    }

    public model(id: string): Model {

        if (this._modelCache.hasKey(id)) {
            throw new Error(`Model '${id}' has already been defined!'`);  
        }

        return this._modelCache.add({ id });
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

    private _build(): Lookup<ModelDefinition> {
        let result: Lookup<ModelDefinition> = {};
        this._modelCache.forEach((mb, id) => {
            result[id] = mb.build();
        });

        return result;
    }
}