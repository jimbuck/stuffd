import { test, GenericTestContext, Context as AvaContext } from 'ava';

import { Context, Stuffd, Prop, Key, Integer, Float, Range, Str, Pick, Enum, List, Bool, Guid, Custom, Ref, Optional, CustomGenerator } from '..';

const NOW = new Date();


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

test(`Decorators`, testModels, createModelsFromDecorators);
test(`Fluent API`, testModels, createModelsFromFluentApi);
test(`Decorators and Fluent API are the same`, t => {
  const { Spaceship: SpaceshipDecorator } = createModelsFromDecorators();
  const { Spaceship: SpaceshipFluent } = createModelsFromFluentApi();

  const decoratorCtx = new Context(135);
  const fluentCtx = new Context(135);

  const decoratorShips = decoratorCtx.create(SpaceshipDecorator, 2);
  const fluentShips = fluentCtx.create(SpaceshipFluent, 2);

  const ctx1Json = decoratorCtx.json();
  const ctx2Json = fluentCtx.json();

  fluentCtx.reset();
  fluentCtx.create(SpaceshipFluent, 2);
  const ctx3Json = fluentCtx.json();

  t.true(decoratorShips.every(s => typeof s.totalMass === 'number'));
  t.true(fluentShips.every(s => typeof s.totalMass === 'number'));
  t.true(decoratorShips.every(s => typeof s.totalThrust === 'number'));
  t.true(fluentShips.every(s => typeof s.totalThrust === 'number'));

  t.deepEqual(decoratorShips, fluentShips);
  t.is(ctx1Json, ctx2Json);
  t.is(ctx1Json, ctx3Json);
  //t.log(ctx1Json);
});

function testModels(t: GenericTestContext<AvaContext<any>>, creatModels: () => any) {
  const { Spaceship } = creatModels();

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
  t.true(ships1.every(s => typeof s.totalThrust === 'number'));
  t.true(ships2.every(s => typeof s.totalThrust === 'number'));

  t.deepEqual(ships1, ships2);
  t.is(ctx1Json, ctx2Json);
  t.is(ctx1Json, ctx3Json);
}

function createModelsFromDecorators() {

  // Create custom, re-usable attributes!
  function PersonName() {
    return Custom(c => `${c.first()} ${c.last()}`);
  }

  @Stuffd()
  class Manufacturer {

    @Key() @Guid()
    id: string;

    @Pick(['Rocketdyne', 'Areojet', 'Boeing', 'Lockheed', 'SpaceX', 'Kerbal'])
    name: string;

    @Range(new Date('01/01/1950'), NOW)
    operatingSince: Date;

    @Custom(c => `${c.first()} ${c.last()}`)
    ceo: string;

    @PersonName()
    founder: string;
  }

  @Stuffd()
  class Engine {

    @Str(/[A-Z]{1,3}-\d{1,3}[DXS]{0,1}/)
    model: string;

    @Integer(1967, 2020)
    year: number;

    @Float(1, 5, 12)
    thrust: number;

    @Float(3, 200, 2000)
    mass: number;

    @Prop()
    manufacturer: Manufacturer;
  }

  @Stuffd()
  class Module {

    @Enum(ModuleType)
    type: string;

    @Enum(ModuleSize)
    size: number;

    @Bool(3 / 4)
    operational: boolean;

    @Float(3, 200, 5000)
    mass: number;
  }

  @Stuffd()
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

    @Integer(0, 20)
    secondaryEngineCount: number;

    @List(Module, 3, 8)
    modules: Array<Module>;

    @Float(3, 5000, 20000)
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

  return { Manufacturer, Engine, Module, Spaceship };
}

function createModelsFromFluentApi() {
    
  interface Spaceship {
    name: string;
    captain: string;
    primaryEngines: any;
    primaryEngineCount: number;
    secondaryEngines: any;
    secondaryEngineCount: number;
    modules: Module[];
    hullMass: number;

    totalThrust: number;
    totalMass: number;
  }

  interface Module {
    type: string;
    size: number;
    operational: boolean;
    mass: number;
  }

  // Create custom, re-usable attributes!
  const personName: CustomGenerator = (c) => `${c.first()} ${c.last()}`;

  const Manufacturer = Stuffd.create('Manufacturer')
    .key('id', id => id.guid())
    .prop('name', n => n.pick(['Rocketdyne', 'Areojet', 'Boeing', 'Lockheed', 'SpaceX', 'Kerbal']))
    .prop('operatingSince', os => os.date(new Date('01/01/1950'), NOW))
    .prop('ceo', c => c.custom(c => `${c.first()} ${c.last()}`))
    .prop('founder', f => f.custom(personName))
    .build();

  const Engine = Stuffd.create('Engine')
    .prop('model', m => m.str(/[A-Z]{1,3}-\d{1,3}[DXS]{0,1}/))
    .prop('year', y => y.integer(1967, 2020))
    .prop('thrust', t => t.float(1, 5, 12))
    .prop('mass', m => m.float(3, 200, 2000))
    .prop('manufacturer', m => m.type(Manufacturer))
    .build();

  const Module = Stuffd.create<Module>('Module')
    .prop('type', t => t.enum(ModuleType, String))
    .prop('size', s => s.enum(ModuleSize, Number))
    .prop('operational', op => op.bool(3 / 4))
    .prop('mass', m => m.float(3, 200, 5000))
    .build();
  
  const Spaceship = Stuffd.create<Spaceship>('Spaceship')
    .prop('name', n => n.str(/((Ares|Athena|Hermes|Icarus|Jupiter|Odyssey|Orion|Daedalus|Falcon|[A-Z] Wing) [XXIIVVCD]{2,3})/))
    .prop('captain', m => m.custom(personName))
    .prop('primaryEngines', pe => pe.type(Engine))
    .prop('primaryEngineCount', pec => pec.integer(1, 5))
    .prop('secondaryEngines', se => se.type(Engine))
    .prop('secondaryEngineCount', sec => sec.integer(0, 20))
    .prop('modules', m => m.list(Module, 3, 8))
    .prop('hullMass', m => m.float(3, 5000, 20000))
    .getter('totalThrust', function() {
      let total = (this.primaryEngines.thrust * this.primaryEngineCount) + (this.secondaryEngines.thrust * this.secondaryEngineCount);
      return Math.round(total * 10) / 10;
    })
    .getter('totalMass', function () {
      let total = this.hullMass;

      total += this.primaryEngines.mass * this.primaryEngineCount;
      total += this.secondaryEngines.mass * this.secondaryEngineCount;

      this.modules.forEach(m => total += m.mass);

      return Math.round(total);
    })
    .build();

  return { Manufacturer, Engine, Module, Spaceship };
}