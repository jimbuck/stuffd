import { test, GenericTestContext, Context as AvaContext } from 'ava';
import { Context, Stuffd, CustomGenerator, Custom, Str, Optional, Prop, Key, Guid, Pick, Range, Float, Integer, Ref } from '..';

test(`Decorators`, testModels, createModelsFromDecorators);
test(`Fluent API`, testModels, createModelsFromFluentApi);
test(`Mixed A`, testModels, createModelsFromMixedA);
test(`Mixed B`, testModels, createModelsFromMixedB);
test(`Mixed C`, testModels, createModelsFromMixedC);

function testModels(t: GenericTestContext<AvaContext<any>>, creatModels: () => any) {
  const { Person, Student, Teacher, Class, Grade } = creatModels();

  const ctx = new Context();

  const students = ctx.create(Student, 50);
  
  const historyTeachers = ctx.create(Teacher, 3, { degree: 'History' });
  const scienceTeachers = ctx.create(Teacher, 3, { degree: 'Science' });
  
  const historyClasses = ctx.using({ 'teacherIdentifier': historyTeachers }).create(Class, 4);
  const scienceClasses = ctx.using({ 'teacherIdentifier': scienceTeachers }).create(Class, 6);
  
  const historyGrades = ctx.cross({ 'studentIdentifier': students, 'classIdentifier': historyClasses }).create(Grade);
  const scienceGrades = ctx.cross({ 'studentIdentifier': students, 'classIdentifier': scienceClasses }).create(Grade);
  
  const data = ctx.data();
  const json = ctx.json();
  
  const historyTeacherIds = historyTeachers.map(ht => ht.identifier);
  const scienceTeacherIds = scienceTeachers.map(st => st.identifier);
  
  t.is(students.length, 50);
  t.true(students.every(s => s instanceof Student && s instanceof Person));
  t.true(students.every(s => s.firstName.length > 0));
  t.true(historyTeachers.every(ht => ht.degree === 'History'));
  t.true(scienceTeachers.every(st => st.degree === 'Science'));
  t.is(historyClasses.length, 4);
  t.is(scienceClasses.length, 6);
  t.true(historyClasses.every(hc => historyTeacherIds.includes(hc.teacherIdentifier)));
  t.true(scienceClasses.every(sc => scienceTeacherIds.includes(sc.teacherIdentifier)));
  for (let student of students) {
    for (let historyClass of historyClasses) {
      let matchingGrade = historyGrades.filter(g => g.studentIdentifier === student.identifier && g.classIdentifier === historyClass.identifier);
      t.is(matchingGrade.length, 1);
    }
    for (let scienceClass of scienceClasses) {
      let matchingGrade = scienceGrades.filter(g => g.studentIdentifier === student.identifier && g.classIdentifier === scienceClass.identifier);
      t.is(matchingGrade.length, 1);
    }
  }
  t.is(data.Student.length, 50);
  t.is(data.Teacher.length, 6);
  t.is(data.Class.length, 10);
  t.is(data.Grade.length, 500);
  t.true(json.length > 0);
}

function createModelsFromDecorators() {
  function LastName() {
    return Custom((c) => c.last());
  }

  class Person {
    @Custom(c => c.first())
    firstName: string;

    @Str(1) @Optional()
    middleInitial: string;

    @LastName()
    lastName: string;

    @Prop()
    dateOfBirth: Date;
  }

  @Stuffd()
  class Student extends Person {

    @Key() @Guid()
    identifier: string;

    @Integer(2000, (new Date().getFullYear()) + 4)
    graduationYear: number;
  }

  @Stuffd()
  class Teacher {
    @Key() @Guid()
    identifier: string;

    @Pick(['Science', 'History', 'Math'])
    degree: string;

    @Float(2, 30000, 80000)
    salary: number;
  }

  @Stuffd()
  class Class {
    @Key() @Guid()
    identifier: string;

    @Integer(1, 9)
    period: number;

    @Str()
    name: string;

    @Ref(Teacher, 'identifier')
    teacherIdentifier: string;

    toString() {
      return `#${this.period} Period ${this.name} (${this.teacherIdentifier})`
    }
  }

  @Stuffd()
  class Grade {
    @Key() @Guid()
    identifier: string;

    @Float(2, 65, 100)
    grade: number;

    @Ref(Student)
    studentIdentifier: string;

    @Ref(Class)
    classIdentifier: string;

    toString() {
      return `${this.studentIdentifier} recieved ${this.grade}% in ${this.classIdentifier}`;
    }
  }

  return { Person, Student, Teacher, Class, Grade };
}

function createModelsFromFluentApi() {
  const lastName: CustomGenerator = (c) => c.last();

  const Person = Stuffd.create('Person')
    .prop('firstName', fn => fn.custom(c => c.first()))
    .prop('middleInitial', ln => ln.str(1))
    .prop('lastName', ln => ln.custom(lastName))
    .prop('dateOfBirth', dob => dob.date())
    .build();

  const Student = Stuffd.create('Student')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('graduationYear', t => t.integer(2000, (new Date().getFullYear()) + 4))
    .build();

  const Teacher = Stuffd.create('Teacher')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('degree', d => d.pick(['Science', 'History', 'Math']))
    .prop('salary', s => s.float(2, 30000, 80000))
    .build();

  const Class = Stuffd.create('Class')
    .key('identifier', id => id.guid())
    .prop('period', st => st.type(Number).integer(1, 9))
    .prop('name', s => s.str())
    .ref('teacherIdentifier', Teacher)
    .toString(function () { return `#${this.period} Period ${this.name} (${this.teacherIdentifier})` })
    .build();

  const Grade = Stuffd.create('Grade')
    .key('identifier', id => id.guid())
    .prop('grade', g => g.float(2, 65, 100))
    .ref('studentIdentifier', Student)
    .ref('classIdentifier', Class)
    .func('toString', function () { return `${this.studentIdentifier} recieved ${this.grade}% in ${this.classIdentifier}` })
    .build();
  
  return { Person, Student, Teacher, Class, Grade };
}

function createModelsFromMixedA() {
  const { Person, Student, Teacher } = createModelsFromDecorators();
  const { Class, Grade } = createModelsFromFluentApi();

  return { Person, Student, Teacher, Class, Grade };
}

function createModelsFromMixedB() {
  const { Person, Student, Teacher, Grade } = createModelsFromDecorators();
  const { Class } = createModelsFromFluentApi();

  return { Person, Student, Teacher, Class, Grade };
}

function createModelsFromMixedC() {
  const { Class, Grade } = createModelsFromDecorators();
  const { Person, Student, Teacher } = createModelsFromFluentApi();

  return { Person, Student, Teacher, Class, Grade };
}