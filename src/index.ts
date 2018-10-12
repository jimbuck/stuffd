import 'reflect-metadata';
import { ModelDecorator } from './lib/services/internal-decorators';
import { ModelBuilder, StaticCreate } from './lib/builders/model-builder';
import { RangeDefaults } from './lib/models/types';

export { Context } from './lib/services/context';
export { PropDecorator as Prop } from './lib/services/internal-decorators';
export * from './lib/services/decorators';
export { CustomGenerator, RangeDefaults } from './lib/models/types';

interface Model {
  defaults: RangeDefaults;
  (name?: string): ClassDecorator;
  create(name: string): ModelBuilder;
}

export const Model: Model = Object.assign(
  ModelDecorator,
  {
    defaults: {
      minInteger: 0,
      maxInteger: 100000000000,
      minFloat: -100000000000,
      maxFloat: 100000000000,
      minString: 1,
      maxString: 16
    },
    create: StaticCreate
  }
);