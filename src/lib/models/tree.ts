
export class Tree<T> {
  
  constructor(public value: T, public parent?: Tree<T>) {
    
  }
}