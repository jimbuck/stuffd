import { test } from 'ava';

import { Context, Model, Prop, Key, Integer, Range, Float, Str, Pick, Enum, List, Bool, Guid, Custom } from '..';

const EMPTY_STRING = '';

test.todo(`Decorators work for relational`);

test(`Decorators work for nested`, t => {
  
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
    return Custom(c => `${c.first()} ${c.last()}`);
  }

  @Model()
  class Manufacturer {

    @Key() @Guid()
    id: string;

    @Pick(['Rocketdyne', 'Areojet', 'Boeing', 'Lockheed', 'SpaceX', 'Kerbal'])
    name: string;

    @Range(new Date('01/01/1950'), new Date())
    operatingSince: Date;
  
    @Custom(c => `${c.first()} ${c.last()}`)
    ceo: string;

    @PersonName()
    founder: string;
  }

  @Model()
  class Engine {

    @Prop()
    manufacturer: Manufacturer;

    @Str(/[A-Z]{1,3}-\d{1,3}[DXS]{0,1}/)
    model: string;
  
    @Float(1) @Range(5, 12)
    thrust: number;
  
    @Integer(1967, 2020)
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

    @Str(/((Ares|Athena|Hermes|Icarus|Jupiter|Odyssey|Orion|Daedalus|Falcon|[A-Z] Wing) [XXIIVVCD]{2,3})/)
    name: string;

    @PersonName()
    captain: string;

    @Prop()
    primaryEngines: Engine;

    @Integer(1, 5)
    primaryEngineCount: number;

    @Prop()
    secondaryEngines: Engine;

    @Integer() @Range(0, 20)
    secondaryEngineCount: number;

    @List(Module) @Range(3, 8)
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
  }

  const ctx1 = new Context(135);
  const ctx2 = new Context(135);

  const ships1 = ctx1.create(Spaceship, 2);
  const ships2a = ctx2.create(Spaceship, 1);
  const ships2b = ctx2.create(Spaceship, 1);
  const ships2 = [...ships2a, ...ships2b];

  const ctx1Json = ctx1.json();
  const ctx2Json = ctx2.json();

  ctx2.reset();
  ctx2.create(Spaceship, 2);
  const ctx3Json = ctx2.json();

  t.true(ships1.every(s => typeof s.totalMass === 'number'));
  t.true(ships2.every(s => typeof s.totalMass === 'number'));

  t.deepEqual(ships1, ships2);
  t.is(ctx1Json, ctx2Json);
  t.is(ctx1Json, ctx3Json);
});