import { EOL } from 'os';
import { Model, Integer, Range, Float, Pattern, Choice, Enum, Collection, Include } from './decorators';
import { Activator } from './lib/services/activator';
import { Bool } from './lib/decorators/common-decorators';

enum ModuleType {
  SleepingQuarters,
  DiningRoom,
  RecRoom,
  Agricultural,
  MedicalBay,
  Engineering,
  FitnessCenter,
  ResearchStation,
  NavigationStation,
  WeaponsBay,
  ShieldRoom,
  CargoBay,
}

enum ModuleSize {
  Small,
  Medium,
  Large
}

@Model()
class Engine {

  @Choice(['Rocketdyne', 'Areojet', 'Boeing', 'Lockheed', 'SpaceX', 'Kerbal'])
  manufacturer: string;

  @Pattern(/[A-Z]{1,3}-\d{1,3}[DXS]{0,1}/)
  model: string;
  
  @Float(1) @Range(5, 12)
  thrust: number;
  
  @Integer() @Range(1967, 2020)
  year: number;

  @Float(3) @Range(200, 2000)
  mass: number;

  public toString() {
    return `${this.manufacturer} ${this.model} (${this.year})`;
  }
}

@Model()
class Module {

  @Enum(ModuleType)
  type: string;

  @Enum(ModuleSize)
  size: number;

  @Bool(3 / 4)
  operational: boolean;

  @Float(3) @Range(200, 5000)
  mass: number;

  public toString() {
    return `${ModuleSize[this.size]} ${this.type} (Operational: ${this.operational})`;
  }
}

@Model()
class Spaceship {

  @Pattern(/[A-Z] Wing/)
  name: string;

  @Include()
  primaryEngines: Engine;

  @Integer() @Range(1, 5)
  primaryEngineCount: number;

  @Include()
  secondaryEngines: Engine;

  @Integer() @Range(0, 20)
  secondaryEngineCount: number;

  @Collection(Module) @Range(3, 8)
  modules: Array<Module>;

  @Float(3) @Range(5000, 20000)
  hullMass: number;

  get totalThrust() {
    return (this.primaryEngines.thrust * this.primaryEngineCount)
      + (this.secondaryEngines.thrust * this.secondaryEngineCount);
  }

  get totalMass() {
    let total = this.hullMass;

    total += this.primaryEngines.mass * this.primaryEngineCount;
    total += this.secondaryEngines.mass * this.secondaryEngineCount;
    
    this.modules.forEach(m => total += m.mass);

    return Math.round(total*100)/100;
  }

  public toString() {
    return `${this.name}:
  Engines:
    ${this.primaryEngineCount}x ${this.primaryEngines}
    ${this.secondaryEngineCount}x ${this.secondaryEngines}
  Modules:
    ${this.modules.map(m => m.toString()).join(EOL + '    ')}
  Stats:
    Total Thrust: ${this.totalThrust} tons
    Total Mass: ${this.totalMass} kg`;
  }
}

let activator = new Activator();

let things = activator.create(Spaceship, 10);
console.log(things.map(t => t.toString()).join(EOL + EOL));
