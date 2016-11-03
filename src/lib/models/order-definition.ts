
import { Type } from '../models/types';

export class OrderDefinition {
  
  public quantity: number;

  constructor(public model: Type, quantity: number) {
    quantity = Math.floor(quantity || 0);
    
    if (quantity < 1) {
      throw new Error(`'quantity' must be greater than zero!`);
    }

    this.quantity = quantity;
  }
}