
import { Dictionary } from './dictionary';
import { ModelDefinition } from './model-definition';
import { Model } from '../builders/model';

export class ModelCache extends Dictionary<Model> {

  constructor() {
    super();
    
  }

  public add(modelDefinition: ModelDefinition): Model {
    return this.set(modelDefinition.id, new Model(this, modelDefinition));
  }
}