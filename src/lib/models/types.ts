
import { Lookup } from './dictionary';

export const EnumType = Symbol('jimmyboh:stuff:enum');
export type EnumType = typeof EnumType;
export const GuidType = Symbol('jimmyboh:stuff:guid');
export type GuidType = typeof GuidType;

export type Constructor<T=any> = { new(): T; };
export type GeneratedConstructor<T=any> = Constructor<T> & { new(props: Lookup<any>): T; };
export type StoredEnum = { names: string[], values: number[] };
export type TypeReference<T=any> = Constructor<T> | EnumType | GuidType;

export type CustomGenerator = (c: Chance.Chance) => any;
