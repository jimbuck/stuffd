
import { TypeDefinition } from '../models/types';

export class OrderDefinition {
  
  public quantity: number;

  constructor(public model: TypeDefinition, quantity: number) {
    quantity = Math.floor(quantity || 0);
    
    if (quantity < 1) {
      throw new Error(`'quantity' must be greater than zero!`);
    }

    this.quantity = quantity;
  }
}