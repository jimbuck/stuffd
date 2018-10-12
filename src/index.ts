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
      maxInteger: 999999999,
      minFloat: -999999999,
      maxFloat: 999999999,
      maxFloatDecimals: 8,
      minStringLength: 1,
      maxStringLength: 16,
      minArrayLength: 1,
      maxArrayLength: 10
    },
    create: StaticCreate
  }
);