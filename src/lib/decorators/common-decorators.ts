
import { EnumType as EnumType, GuidType as GuidType, TypeReference, StoredEnum, CustomGenerator, Constructor } from '../models/types';
import { Prop } from './base-decorator';
import { getPrimaryKey } from '../services/meta-reader';

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

export function Key() {
  return Prop({ key: true });
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

export function Guid() {
  return Type(GuidType);
}

export function Type<TPrimary, TSecondary>(type: TypeReference<TPrimary>, secondaryType: StoredEnum|TypeReference<TSecondary> = null) {
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

export function Collection(type: StoredEnum|TypeReference<any>) {
  return Type(Array, type);
}

export function Choice<T>(choices: T[] | (() => T[])) {
  return Prop({ choices });
}

export const Pattern: PatternDef = function Pattern(pattern: string | RegExp, flags?: string) {
  if (typeof pattern === 'string') pattern = new RegExp(pattern, flags);
  return Prop({ pattern });
}

export function Ref<T, K extends keyof T>(ref: Constructor<T>, refKey?: K) {
  let foreignKey = typeof refKey === 'string' ? refKey : getPrimaryKey(ref);
  return Prop({ ref, foreignKey });
}

export function Child() {
  return Prop({});
}

export function Custom(custom: CustomGenerator) {
  return Prop({ custom });
}