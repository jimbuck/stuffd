import { GenerationDefaults } from './types';


export const defaults: GenerationDefaults = {
  minInteger: 0,
  maxInteger: 999999999,
  minFloat: -9999999,
  maxFloat: 9999999,
  maxFloatDecimals: 8,
  minStringLength: 1,
  maxStringLength: 16,
  minArrayLength: 1,
  maxArrayLength: 10,
  minDate: new Date(0),
  maxDate: new Date()
};