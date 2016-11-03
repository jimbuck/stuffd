
// TODO: Find a RNG that supports seeds!

export class Rand {

  constructor(public seed: number) {

  }

  public next(): number {
    return Math.random();
  }

  public nextFloat(min: number, max: number): number {
    let range = max - min;
    return min + (this.next() * range);
  }

  public nextInt(min: number, max: number): number{
    return Math.floor(this.nextFloat(min, max));
  }

  public nextDate(min: Date, max: Date): Date {
    let ms = this.nextFloat(min.valueOf(), max.valueOf());

    return new Date(ms);
  }

}