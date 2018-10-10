import { Context } from '.';

const ctx = new Context();

const Person = ctx.model('Person')
    .prop('firstName', fn => fn.type(String))
    .prop('lastName', ln => ln.string())
    .prop('dateOfBirth', dob => dob.type(Date));

const Student = ctx.model('Student')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('graduationYear', t => t.integer(2000, (new Date().getFullYear()) + 4));

const Teacher = ctx.model('Teacher')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('degree', d=> d.choices(['Science', 'History', 'Math']))
    .prop('salary', s => s.float(30000, 150000).decimals(2));

const Class = ctx.model('Class')
    .key('identifier', id => id.guid())
    .prop('period', st => st.type(Number).integer(1, 9))
    .prop('name', s => s.string())
    .ref('teacherIdentifier', Teacher)
    .toString((c) => `#${c.period} Period ${c.name} (${c.teacherIdentifier})`);

const Grade = ctx.model('Grade')
    .prop('identifier', id => id.key().guid())
    .prop('grade', g => g.float(65, 100).decimals(2))
    .ref('studentIdentifier', Student)
    .ref('classIdentifier', Class)
    .toString((c) => `${c.studentIdentifier} recieved ${c.grade}% in ${c.classIdentifier}`);

const historyTeachers = ctx.create(Teacher, 3, { degree: 'History' });
const scienceTeachers = ctx.create(Teacher, 3, { degree: 'Science' });

const historyClasses = ctx.using({ 'teacherIdentifier': historyTeachers }).create(Class, 4);
const scienceClasses = ctx.using({ 'teacherIdentifier': scienceTeachers }).create(Class, 6);

const students = ctx.create(Student, 50);

const historyGrades = ctx.cross({ studentIdentifier: students, classIdentifier: historyClasses }).create(Grade);
const scienceGrades = ctx.cross({ studentIdentifier: students, classIdentifier: scienceClasses }).create(Grade);

let data = ctx.data();
// returns:
// {
//     teachers: [...],
//     students: [...],
//     classes: [...],
//     grades: [...]
// }

ctx.clear();

ctx.data();
// returns:
// { }