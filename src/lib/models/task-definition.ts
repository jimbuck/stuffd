
import { Order } from '../builders/order';

export interface TaskDefinition {
  name?: string;
  orders?: Array<Order>;
  calls?: Array<string>;
}