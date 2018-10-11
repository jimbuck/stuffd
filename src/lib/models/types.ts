
export type Lookup<T=any> = { [key: string]: T };

export const EnumType = Symbol('jimmyboh:stuffd:enum');
export type EnumType = typeof EnumType;
export const GuidType = Symbol('jimmyboh:stuffd:guid');
export type GuidType = typeof GuidType;

export type Constructor<T=any> = { new(): T; };
export type GeneratedConstructor<T=any> = Constructor<T> & { new(props: Lookup): T; };
export type GeneratedArray<T=any> = Array<T>;
export type TypeReference<T=any> = Constructor<T> | EnumType | GuidType;

export type CustomGenerator = (c: Chance.Chance) => any;

export interface RangeDefaults {
  minInteger: number;
  maxInteger: number;
  minFloat: number;
  maxFloat: number;
  minString: number;
  maxString: number;
}