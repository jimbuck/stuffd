

export class StoredEnum {
  public readonly names: string[] = [];
  public readonly values: number[] = [];

  constructor(enumType: any) {
    for (let item in enumType) {
      if (isNaN(Number(item))) {
        this.names.push(item);
        this.values.push(Number(enumType[item]));
      }
    }
  }
}