import { ModelBuilder } from './model-builder';

export class TaskBuilder {

  private _tasks: Array<() => void> = [];

  constructor() {    
  }

  public static create(modelDef: ModelBuilder, count?: number, constants?: { [prop: string]: any }) {
    return new TaskBuilder();
  }

  
}