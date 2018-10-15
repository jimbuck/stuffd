import { test } from 'ava';
import { Context, Model, CustomGenerator } from '..';

test.todo(`Fluent work for nested`);

test(`Fluent work for relational`, t => {
  const lastName: CustomGenerator = (c) => c.last();

  const Person = Model.create('Person')
    .prop('firstName', fn => fn.custom(c => c.first()))
    .prop('middleInitial', ln => ln.str(1))
    .prop('lastName', ln => ln.custom(lastName))
    .prop('dateOfBirth', dob => dob.date())
    .build();

  const Student = Model.create('Student')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('graduationYear', t => t.integer(2000, (new Date().getFullYear()) + 4))
    .build();

  const Teacher = Model.create('Teacher')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('degree', d => d.pick(['Science', 'History', 'Math']))
    .prop('salary', s => s.float(2, 30000, 80000))
    .build();

  const Class = Model.create('Class')
    .key('identifier', id => id.guid())
    .prop('period', st => st.type(Number).integer(1, 9))
    .prop('name', s => s.str())
    .ref('teacherIdentifier', Teacher)
    .toString((c) => `#${c.period} Period ${c.name} (${c.teacherIdentifier})`)
    .build();

  const Grade = Model.create('Grade')
    .key('identifier', id => id.guid())
    .prop('grade', g => g.float(2, 65, 100))
    .ref('studentIdentifier', Student)
    .ref('classIdentifier', Class)
    .toString((c) => `${c.studentIdentifier} recieved ${c.grade}% in ${c.classIdentifier}`)
    .build();

  const ctx = new Context(246);

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
  t.is(data.Student.length, 50);
});