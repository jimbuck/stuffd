
import { Type } from '../models/types';
import { TaskDefinition } from '../models/task-definition';
import { OrderDefinition } from '../models/order-definition';

export class Task {

  private _orderDefs: Set<OrderDefinition>;

  constructor(private _name: string) {
    this._orderDefs = new Set<any>();
  }

  public create(type: Type, count: number = 1, constantProps: {} = {}): OrderDefinition {
    console.log(`Ordering ${count} ${type}'s...`);
    let order = new OrderDefinition(type, count);

    this._orderDefs.add(order);

    return order;
  }

  public call(taskName: string): this {
    console.log(`Calling ${taskName}...`);
    return this;
  }

  public build(): TaskDefinition {
    let taskDef = {};



    return taskDef;
  }
}