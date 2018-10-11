import { Context, Model, CustomGenerator } from '.';

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
    .prop('degree', d => d.choices(['Science', 'History', 'Math']))
    .prop('salary', s => s.float(30000, 80000).decimals(2))
    .build();

const Class = Model.create('Class')
    .key('identifier', id => id.guid())
    .prop('period', st => st.type(Number).integer(1, 9))
    .prop('name', s => s.str())
    .ref('teacherIdentifier', Teacher)
    .toString((c) => `#${c.period} Period ${c.name} (${c.teacherIdentifier})`)
    .build();

const Grade = Model.create('Grade')
    .prop('identifier', id => id.key().guid())
    .prop('grade', g => g.float(65, 100).decimals(2))
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

const historyGrades = ctx.cross({ studentIdentifier: students, classIdentifier: historyClasses }).create(Grade);
const scienceGrades = ctx.cross({ studentIdentifier: students, classIdentifier: scienceClasses }).create(Grade);

let data1 = ctx.data();
// returns:
// {
//     teachers: [...],
//     students: [...],
//     classes: [...],
//     grades: [...]
// }

ctx.clear();

let data2 = ctx.data();
// returns:
// { }

console.log(`Done fluent.`);