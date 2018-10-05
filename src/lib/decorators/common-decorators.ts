
import { Enum as EnumType, TypeReference, StoredEnum, Constructor } from '../models/types';
import { Prop } from './base-decorator';
import { Lookup } from '../models/dictionary';

interface RangeDef {
  (min: number, max: number): PropertyDecorator;
  (min: Date, max: Date): PropertyDecorator;
}
interface PatternDef {
  (pattern: string, flags: string): PropertyDecorator;
  (pattern: RegExp): PropertyDecorator;
}
interface IntegerDef {
  (): PropertyDecorator;
  (min: number, max: number): PropertyDecorator;
}

export function Length(length: number) {
    return Prop({ length });
}

export function Optional(rate: number = 0.5) {
  return Prop({ optional: rate });
}

export const Range: RangeDef = function Range(min: number|Date, max: number|Date)  {
  return Prop({ min, max });
};

export function Float(decimals?: number) {
  return Prop({ decimals });
}

export function Integer() {
  return Prop({ decimals: 0 });
}

export function Bool(truthRate: number = 0.5) {
  return Prop({ truthRate });
}

export function Type<TPrimary, TSecondary>(type: Symbol|Constructor<TPrimary>, secondaryType: Symbol|StoredEnum|Constructor<TSecondary> = null) {
  return Prop({ type, secondaryType });
}

export function Enum(specificType: any) {
  const storedEnum: StoredEnum = {
    names: [],
    values: []
  };
  for (let item in specificType) {
    if (isNaN(Number(item))) {
      storedEnum.names.push(item);
      storedEnum.values.push(Number(specificType[item]));
    }
  }
  return Type(EnumType, storedEnum);
}

export function Collection(type: Symbol|StoredEnum|Constructor<any>) {
  return Type(Array, type);
}

export function Choice<T>(choices: T[] | (() => T[])) {
  return Prop({ choices });
}

export const Pattern: PatternDef = function Pattern(pattern: string | RegExp, flags?: string) {
  if (typeof pattern === 'string') pattern = new RegExp(pattern, flags);
  return Prop({ pattern });
}

export function Child() {
  return Prop({});
}