import { EnumType as EnumType, GuidType as GuidType, TypeReference, CustomGenerator, Constructor } from '../models/types';
import { StoredEnum } from '../models/stored-enum';
import { PropDecorator } from './internal-decorators';
import { getPrimaryKey } from '../utils/meta-reader';

interface RangeDef {
  (min: number, max: number): PropertyDecorator;
  (min: Date, max: Date): PropertyDecorator;
}

interface IntegerDef {
  (): PropertyDecorator;
  (minLength: number, maxLength: number): PropertyDecorator;
}

interface FloatDef {
  (): PropertyDecorator;
  (decimals: number): PropertyDecorator;
  (minLength: number, maxLength: number): PropertyDecorator;
  (decimals: number, minLength: number, maxLength: number): PropertyDecorator;
}

interface StringDef {
  (): PropertyDecorator;
  (minLength: number, maxLength: number): PropertyDecorator;
  (pattern: RegExp): PropertyDecorator;
}

export function Key() {
  return PropDecorator({ key: true });
}

export function Length(length: number) {
  return Range(length, length);
}

export function Optional(rate: number = 0.5) {
  return PropDecorator({ optional: rate });
}

export const Range: RangeDef = function Range(min: number | Date, max: number | Date) {
  return PropDecorator({ min, max });
};

export const Float: FloatDef = function Float(decimals?: number, minLength?: number, maxLength?: number) {
  return PropDecorator({ decimals });
}

export const Integer: IntegerDef = function Integer(min?: number, max?: number) {
  if (typeof min === 'number') {
    return PropDecorator({ decimals: 0, min, max });
  }
  return PropDecorator({ decimals: 0 });
}

export function Bool(truthRate: number = 0.5) {
  return PropDecorator({ truthRate });
}

export function Guid() {
  return Type(GuidType);
}

export function Type<TPrimary, TSecondary>(type: TypeReference<TPrimary>, secondaryType: TypeReference<TSecondary> = null) {
  return PropDecorator({ type, secondaryType });
}

export function Enum(enumType: any) {
  const storedEnum = new StoredEnum(enumType);

  return PropDecorator({ type: EnumType, secondaryType: storedEnum });
}

export function Collection(itemType: StoredEnum | TypeReference<any>) {
  return PropDecorator({ type: Array, secondaryType: itemType });
}

export function Choice<T>(choices: T[] | (() => T[])) {
  return PropDecorator({ choices });
}

export const Str: StringDef = function Pattern(pattern?: number | RegExp, maxLength?: number) {
  if (pattern instanceof RegExp) {
    return PropDecorator({ type: global.String, pattern });
  } else if (typeof pattern === 'number') {
    return PropDecorator({ type: global.String, min: pattern, max: maxLength });
  }

  if (typeof pattern === 'undefined') {
    return Type(global.String);
  }
}

export function Ref<T, K extends keyof T>(ref: Constructor<T>, refKey?: K) {
  let foreignKey = typeof refKey === 'string' ? refKey : getPrimaryKey(ref);
  return PropDecorator({ ref, foreignKey });
}

export function Child() {
  return PropDecorator({});
}

export function Custom(custom: CustomGenerator) {
  return PropDecorator({ custom });
}