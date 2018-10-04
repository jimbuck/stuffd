import { Stuff, Integer, Min, Max, Decimals, Pattern } from './decorators';

let ships = Stuff.create<Spaceship>(2);

@Stuff()
class Engine {

  @Pattern(/(Rocketdyne|Areojet|Boeing|Lockheed|Kerbal) (A-Z)-\d{2,3}(D|X\S){0,1}/)
  model: string;
  
  @Decimals(3) @Min(0) @Max(4000)
  horsepower: number;
  
  @Decimals(0) @Min(1967) @Max(2020)
  year: number;
}

@Stuff()
class Module {

}

@Stuff()
class Spaceship {

  @Decimals(0) @Min(0) @Max(10)
  landingGear: number;

  primaryEngines: Engine;

  @Integer() @Min(1) @Max(5)
  primaryEngineCount: number;

  secondaryEngines: Engine;

  @Integer() @Min(0) @Max(20)
  secondaryEngineCount: number;

  modules: Array<Module>;
}