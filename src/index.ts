import 'reflect-metadata';
import { ModelDecorator } from './lib/services/internal-decorators';
import { ModelBuilder, StaticCreate, StaticCreateEnum, CreateEnumMethod } from './lib/builders/model-builder';
import { GenerationDefaults, TaskOptions } from './lib/models/types';
import { TaskRunner, TaskAction } from './lib/services/task-runner';
import { defaults } from './lib/models/defaults';

export { Context } from './lib/services/context';
export { Chance } from './lib/models/types';

interface Stuffd {
  (name?: string): ClassDecorator;
  defaults: GenerationDefaults;
  create<T=any>(name: string): ModelBuilder<T>;
  createEnum: CreateEnumMethod;
  task(taskName: string, action: TaskAction): void;
  run(taskName: string, options?: TaskOptions): Promise<void>;
}

const taskRunner = new TaskRunner();

export const Stuffd = ModelDecorator as Stuffd;
Stuffd.defaults = defaults;
Stuffd.create = StaticCreate;
Stuffd.createEnum = StaticCreateEnum;
Stuffd.task = taskRunner.task.bind(taskRunner);
Stuffd.run = taskRunner.run.bind(taskRunner);