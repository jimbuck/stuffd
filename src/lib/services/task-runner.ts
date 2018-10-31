import { Context } from './context';
import { Lookup, TaskOptions } from '../models/types';

export type TaskAction = (ctx: Context) => void | Promise<void>;

export class TaskRunner {

  private _tasks: Lookup<TaskAction> = {};
  
  public task(taskName: string, action: TaskAction): void {
    this._tasks[taskName] = action;
  }

  public async run(taskName: string, options?: TaskOptions): Promise<void> {
    if (!taskName) throw new Error(`Must specify a task name!`);
    options = Object.assign({
      iterations: 1,
    }, options);
    
    const task = this._tasks[taskName];

    if (!task) throw new Error(`No task '${taskName}' is registered!`);

    let ctx = new Context(options.seed);
    await task(ctx);

    ctx.reset();
    ctx = null;
  }
}