import { Context } from './';

const ctx = new Context();

const Person = ctx.model('Person')
    .prop('firstName', fn => fn.type(String))
    .prop('lastName', ln => ln.string())
    .prop('dateOfBirth', dob => dob.type(Date));

const Student = ctx.model('Student')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('graduationYear', t => t.integer(1900, (new Date().getFullYear()) + 4));

const Teacher = ctx.model('Teacher')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('degree', d=> d.choices(['Science', 'History']))
    .prop('salary', s => s.float(30000, 150000).decimals(2));

const Class = ctx.model('Class')
    .key('identifier', id => id.guid())
    .prop('period', st => st.type(Number).integer(1, 9))
    .prop('name', s => s.string())
    .ref('teacherIdentifier', Teacher);

const Grade = ctx.model('Grade')
    .prop('identifier', id => id.key().guid())
    .prop('grade', g => g.float(0, 100).decimals(2))
    .ref('studentIdentifier', Student)
    .ref('classIdentifier', Class)

ctx.task('default', t => {
    t.create(Teacher, 1);
    t.create(Class, 1);
    t.create(Student, 20);
});

ctx.task('test', t => {
    const historyTeachers = t.create(Teacher, 3, { degree: 'history' });
    const scienceTeachers = t.create(Teacher, 3, { degree: 'science' });
      
    const historyClasses = t.create(Class, 4)
    const scienceClasses = t.create(Class, 6);

    const students = t.create(Student, 50);
    
    // In progress work...
    // historyClasses.join(historyTeachers, 'teacherIdentifier', { sequential: false, duplicates: true });
    // scienceClasses.join(scienceTeachers, 'teacherIdentifier');

    // const classes = t.combine(historyClasses, scienceClasses);

    // const grades = t.cross(classes, students).to(Grade);
});

ctx.run('default'); // TODO: Figure out Receivers...