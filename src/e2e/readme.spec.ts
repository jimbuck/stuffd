import { EOL } from 'os';
import { test } from 'ava';
import { Stuffd, Key, Int, Custom, Range, Str, Ref, Guid, Float } from '..';
import { Context } from '../lib/services/context';

function createFakeStream() {
  return {
    on: function () { },
    once: function () { },
    write: function () { },
    emit: function () { },
    end: function () { }
  }
}

const myDbInserter: any = createFakeStream();
const myFileInserter: any = createFakeStream();


test('Readme decorator example works', t => {
  @Stuffd()
  class Student {
  
    @Key() @Guid()
    id: string;
  
    @Custom(c => `${c.first()} ${c.last()}`)
    name: string;
    
    @Range(new Date('01/01/1950'), new Date('12/31/2010'))
    dateOfBirth: Date;
  
    @Str(/\(\d{3}\)\d{3}-\d{4}/)
    phone: string;
  }
  
  @Stuffd()
  class Teacher {
  
    @Key() @Guid()
    id: string;
  
    @Custom(c => `${c.first()} ${c.last()}`)
    name: string;
  }
  
  @Stuffd()
  class Class {
    
    @Str(/[A-Z]{2}-\d{4}-[a-e]/)
    id: string;
  
    @Ref(Teacher)
    teacherId: string;
  
    @Int(1, 9)
    period: number;
  }
  
  @Stuffd()
  class Grade {
  
    @Ref(Student)
    studentId: string;
  
    @Ref(Class, 'id')
    classId: string;
  
    @Float(1, 60, 100)
    grade: number;
  }

  const ctx = new Context(246);

  // Create array of 50 students...
  const students = ctx.create(Student, 50);
  // [...]

  const teachers = ctx.create(Teacher, 3);
  // [...]

  // Create array of 5 classes referencing a teacher's id from the 3 in that list...
  const classes = ctx.using({ 'teacherId': teachers }).create(Class, 5);
  // [...]

  // Create array of grades, using the 3 classes above for the classId and making one for each student.
  const grades = ctx.using({ 'classId': classes }).cross({ 'studentId': students }).create(Grade);
  // [...]

  const isStudent = students[0] instanceof Student;
  // true

  // Get an object with all the instances created...
  const allData = ctx.data();
  // { "Student": [...], "Teacher": [...], etc. }

  const allJson = ctx.json(true); // Formatted
  // '{ "Student": [...], "Teacher": [...], etc. }'

  // Pipe the data somewhere!
  ctx.stream().pipe(myDbInserter);
  // { "type": "Student", "value": { ... } }

  // Pipe the JSON somewhere!
  ctx.stream().pipe(myFileInserter);
  // (same as above but 1 per line)

  t.pass();
});

test(`Readme fluent api example works`, t => {

  // Create Typescript-like enums with explicit integers!
  const ModuleType = Stuffd.createEnum({
    SleepingQuarters: 0,
    DiningRoom: 1,
    RecRoom: 2,
    Agricultural: 3,
    MedicalBay: 4,
    Engineering: 5,
    FitnessCenter: 6,
    ResearchStation: 7,
    NavigationStation: 8,
    WeaponsBay: 9,
    ShieldRoom: 10,
    CargoBay: 11
  });

  // Create Typescript-like enums with implicit integers!
  const ModuleSize = Stuffd.createEnum(['Small', 'Medium', 'Large']);

  // Create custom, re-usable attributes!
  const personName = (c: any) => `${c.first()} ${c.last()}`;

  const Manufacturer = Stuffd.create('Manufacturer')
    .key('id', id => id.guid())
    .prop('name', n => n.pick(['Rocketdyne', 'Areojet', 'Boeing', 'Lockheed', 'SpaceX', 'Kerbal']))
    .prop('operatingSince', os => os.date(new Date('01/01/1950'), new Date()))
    .prop('ceo', c => c.custom(c => `${c.first()} ${c.last()}`))
    .prop('founder', f => f.custom(personName))
    .build();

  const Engine = Stuffd.create('Engine')
    .prop('model', m => m.str(/[A-Z]{1,3}-\d{1,3}[DXS]{0,1}/))
    .prop('year', y => y.int(1967, 2020))
    .prop('thrust', t => t.float(1, 5, 12))
    .prop('mass', m => m.float(3, 200, 2000))
    .prop('manufacturer', m => m.type(Manufacturer))
    .toString(function () {
      return `${this.manufacturer.name} ${this.model} (${this.year})`;
    })
    .build();

  const Module = Stuffd.create('Module')
    .prop('type', t => t.enum(ModuleType, String))
    .prop('size', s => s.enum(ModuleSize, Number))
    .prop('operational', op => op.bool(3 / 4))
    .prop('mass', m => m.float(3, 200, 5000))
    .toString(function () {
      return `[${ModuleSize[this.size]}] ${this.type}${this.operational ? '' : ' (undergoing maintenance)'}`;
    })
    .build();

  const Spaceship = Stuffd.create('Spaceship')
    .prop('name', n => n.str(/((Ares|Athena|Hermes|Icarus|Jupiter|Odyssey|Orion|Daedalus|Falcon|[A-Z] Wing) [XXIIVVCD]{2,3})/))
    .prop('captain', m => m.custom(personName))
    .prop('primaryEngines', pe => pe.type(Engine))
    .prop('primaryEngineCount', pec => pec.int(1, 5))
    .prop('secondaryEngines', se => se.type(Engine))
    .prop('secondaryEngineCount', sec => sec.int(0, 20))
    .prop('modules', m => m.list(Module, 3, 8))
    .prop('hullMass', m => m.float(3, 5000, 20000))
    .getter('totalThrust', function () {
      let total = (this.primaryEngines.thrust * this.primaryEngineCount) + (this.secondaryEngines.thrust * this.secondaryEngineCount);
      return Math.round(total * 10) / 10;
    })
    .getter('totalMass', function () {
      let total = this.hullMass;

      total += this.primaryEngines.mass * this.primaryEngineCount;
      total += this.secondaryEngines.mass * this.secondaryEngineCount;

      this.modules.forEach((m: any) => total += m.mass);

      return Math.round(total);
    })
    .toString(function () {
      let str = [this.name + ':'];
      str.push(`  Crew:`);
      str.push(`    ${this.captain}`);
      str.push(`  Engines:`);
      str.push(`    ${this.primaryEngineCount}x ${this.primaryEngines}`);
      if (this.secondaryEngineCount > 0) str.push(`    ${this.secondaryEngineCount}x ${this.secondaryEngines}`);
      str.push(`  Modules:`);
      str.push('    ' + this.modules.map((m: any) => m.toString()).join(EOL + '    '));
      str.push(`  Stats:`);
      str.push(`    Total Thrust: ${this.totalThrust} tons`);
      str.push(`    Total Mass: ${this.totalMass} kg`);
      
      return str.join(EOL);
    })
    .build();

  // Optionally provide a seed (same seed + same operations = same result)
  const ctx = new Context(135);

  const fleet = ctx.create(Spaceship, 10);

  //console.log(fleet.map(ship => ship.toString()).join(''));
  // Prints out all the ship details...

  t.pass();
});