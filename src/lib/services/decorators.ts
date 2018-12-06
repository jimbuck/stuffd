import { TypeReference, CustomGenerator, Constructor } from '../models/types';
import { StoredEnum } from '../models/stored-enum';
import { PropDecorator } from './internal-decorators';

interface RangeDef {
  (min: number, max: number): PropertyDecorator;
  (min: Date, max: Date): PropertyDecorator;
}

interface IntDef {
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

interface ListDef {
  (itemType: StoredEnum | TypeReference<any>): PropertyDecorator;
  (itemType: StoredEnum | TypeReference<any>, length: number): PropertyDecorator;
  (itemType: StoredEnum | TypeReference<any>, min: number, max: number): PropertyDecorator;
}

export function Key() {
  return PropDecorator(p => {
    p['_definition'].key = true;
    return p;
  });
}

export function Optional(occuranceRate?: number) {
  return PropDecorator(p => p.optional(occuranceRate));
}

export const Float: FloatDef = function Float(decimals?: number, min?: number, max?: number) {
  if (arguments.length === 2) {
    max = min;
    min = decimals;
    decimals = null;
  }
  return PropDecorator(p => p.float(decimals, min, max));
};

export const Int: IntDef = function Int(min?: number, max?: number) {
  return PropDecorator(p => p.int(min, max));
};

export function Range(min: Date, max: Date) {
  return PropDecorator(p => p.date(min, max));
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

export const List: ListDef = function List(itemType: StoredEnum | TypeReference<any>, min?: number, max?: number) {
  return PropDecorator(p => p.list(itemType, min, max));
};

export function Pick<T>(choices: T[] | (() => T[])) {
  return PropDecorator(p => p.pick(choices));
}

export const Str: StringDef = function Pattern(pattern?: number | RegExp, maxLength?: number) {
  return PropDecorator(p => p.str(pattern as any, maxLength));
};

export function Ref<T, K extends Extract<keyof T, string>>(ref: Constructor<T>, refKey?: K) {
  return PropDecorator(p => p.ref(ref, refKey));
}

export function Custom(custom: CustomGenerator) {
  return PropDecorator(p => p.custom(custom));
}