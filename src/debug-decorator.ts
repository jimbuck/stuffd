import { EOL } from 'os';
import { Context, Model, Key, Integer, Range, Float, Pattern, Choice, Enum, Collection, Child, Bool, Guid, Ref, Custom } from '.';

const EMPTY_STRING = '';

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

// Create custom, re-usable attributes!
function PersonName() {
  return Custom(c => `${c.first()} ${c.letter({casing: 'upper'})}. ${c.last()}`);
}

@Model()
class Manufacturer {

  @Key() @Guid()
  id: string;

  @Choice(['Rocketdyne', 'Areojet', 'Boeing', 'Lockheed', 'SpaceX', 'Kerbal'])
  name: string;

  @Range(new Date('01/01/1950'), new Date())
  operatingSince: Date;
  
  @Custom(c => `${c.first()} ${c.letter({case: 'upper'})}. ${c.last()}`)
  ceo: string;

  @PersonName()
  founder: string;
}

@Model()
class Engine {

  @Ref(Manufacturer, 'id')
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
    return `${ModuleSize[this.size]} ${this.type}${this.operational ? EMPTY_STRING : ' (undergoing maintenance)'}`;
  }
}

@Model()
class Spaceship {

  @Pattern(/((Ares|Athena|Hermes|Icarus|Jupiter|Odyssey|Orion|Daedalus|Falcon|[A-Z] Wing) [XXIIVVCD]{2,3})/)
  name: string;

  @PersonName()
  captain: string;

  @Child()
  primaryEngines: Engine;

  @Integer() @Range(1, 5)
  primaryEngineCount: number;

  @Child()
  secondaryEngines: Engine;

  @Integer() @Range(0, 20)
  secondaryEngineCount: number;

  @Collection(Module) @Range(3, 8)
  modules: Array<Module>;

  @Float(3) @Range(5000, 20000)
  hullMass: number;

  get totalThrust() {
    let total = (this.primaryEngines.thrust * this.primaryEngineCount)
      + (this.secondaryEngines.thrust * this.secondaryEngineCount);
    
    
    return Math.round(total * 10) / 10;
  }

  get totalMass() {
    let total = this.hullMass;

    total += this.primaryEngines.mass * this.primaryEngineCount;
    total += this.secondaryEngines.mass * this.secondaryEngineCount;
    
    this.modules.forEach(m => total += m.mass);

    return Math.round(total);
  }

  public toString() {
    let str = [this.name + ':'];
    str.push(`  Crew:`);
    str.push(`    ${this.captain}`);
    str.push(`  Engines:`);
    str.push(`    ${this.primaryEngineCount}x ${this.primaryEngines}`);
    if (this.secondaryEngineCount > 0) str.push(`    ${this.secondaryEngineCount}x ${this.secondaryEngines}`);
    str.push(`  Modules:`);
    str.push('    ' + this.modules.map(m => m.toString()).join(EOL + '    '));
    str.push(`  Stats:`);
    str.push(`    Total Thrust: ${this.totalThrust} tons`);
    str.push(`    Total Mass: ${this.totalMass} kg`);
    
    return str.join(EOL);
  }
}

const ctx1 = new Context(135);
const ctx2 = new Context(135);

let thing1 = ctx1.create(Spaceship, 2);
let thing2a = ctx2.create(Spaceship, 1);
let thing2b = ctx2.create(Spaceship, 1);
let thing2 = [...thing2a, ...thing2b];

console.log('object JSON:', JSON.stringify(thing1[0]) === JSON.stringify(thing2[0]));
let ctx1Json = ctx1.json();
let ctx2Json = ctx2.json();
console.log('Context JSON:', ctx1Json === ctx2Json);
// console.log(thing1.map(t => t.toString()).join(EOL + EOL));
// console.log(thing2.map(t => t.toString()).join(EOL + EOL));

console.log(`Done decorator.`);