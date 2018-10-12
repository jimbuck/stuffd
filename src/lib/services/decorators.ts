import { TypeReference, CustomGenerator, Constructor } from '../models/types';
import { StoredEnum } from '../models/stored-enum';
import { PropDecorator } from './internal-decorators';

interface RangeDef {
  (min: number, max: number): PropertyDecorator;
  (min: Date, max: Date): PropertyDecorator;
}

interface IntegerDef {
  (): PropertyDecorator;
  (min: number, max: number): PropertyDecorator;
}

interface FloatDef {
  (): PropertyDecorator;
  (decimals: number): PropertyDecorator;
  (min: number, max: number): PropertyDecorator;
  (decimals: number, min: number, max: number): PropertyDecorator;
}

interface StringDef {
  (): PropertyDecorator;
  (length: number): PropertyDecorator;
  (minLength: number, maxLength: number): PropertyDecorator;
  (pattern: RegExp): PropertyDecorator;
}

export function Key() {
  return PropDecorator(p => {
    p['_definition'].key = true;
    return p;
  });
}

export function Length(length: number) {
  return PropDecorator(p => p.length(length));
}

export function Optional(occuranceRate?: number) {
  return PropDecorator(p => p.optional(occuranceRate));
}

export const Range: RangeDef = function Range(min: number | Date, max: number | Date) {
  return PropDecorator(p => p.range(min as any, max as any));
};

export const Float: FloatDef = function Float(decimals?: number, min?: number, max?: number) {
  if (arguments.length === 2) {
    max = min;
    min = decimals;
    decimals = null;
  }
  return PropDecorator(p => p.float(decimals, min, max));
}

export const Integer: IntegerDef = function Integer(min?: number, max?: number) {
  return PropDecorator(p => p.integer(min, max));
}

export function Bool(truthRate: number = 0.5) {
  return PropDecorator(p => p.bool(truthRate));
}

export function Guid() {
  return PropDecorator(p => p.guid());
}

export function Type<TPrimary, TSecondary>(type: TypeReference<TPrimary>, secondaryType: TypeReference<TSecondary> = null) {
  return PropDecorator(p => p.type(type, secondaryType));
}

export function Enum(enumType: any) {
  return PropDecorator(p => p.enum(enumType));
}

export function List(itemType: StoredEnum | TypeReference<any>) {
  return PropDecorator(p => p.list(itemType));
}

export function Pick<T>(choices: T[] | (() => T[])) {
  return PropDecorator(p => p.pick(choices));
}

export const Str: StringDef = function Pattern(pattern?: number | RegExp, maxLength?: number) {
  return PropDecorator(p => p.str(pattern as any, maxLength));
}

export function Ref<T, K extends keyof T>(ref: Constructor<T>, refKey?: K) {
  return PropDecorator(p => p.ref(ref, refKey));
}

export function Custom(custom: CustomGenerator) {
  return PropDecorator(p => p.custom(custom));
}