import { Context } from './';

let ctx = new Context();

let Person = ctx.model('Person')
    .prop('firstName', fn => fn.type(String))
    .prop('lastName', ln => ln.string())
    .prop('dateOfBirth', dob => dob.type(Date));

let Student = ctx.model('Student')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('graduationYear', t => t.integer(1900, (new Date().getFullYear()) + 4));

let Teacher = ctx.model('Teacher')
    .inherits(Person)
    .key('identifier', id => id.guid())
    .prop('degree', d=> d.choices(['Science', 'History']))
    .prop('salary', s => s.float(30000, 150000).decimals(2));

let Class = ctx.model('Class')
    .key('identifier', id => id.guid())
    .prop('period', st => st.type(Number).integer(1, 9))
    .prop('name', s => s.string())
    .ref('teacherIdentifier', Teacher);

let Grade = ctx.model('Grade')
    .prop('identifier', id => id.key().guid())
    .prop('grade', g => g.float(0, 100).decimals(2))
    .ref('studentIdentifier', Student)
    .ref('classIdentifier', Class)

let defaultTask = ctx.task('default', (t) => {
    let historyTeachers = t.create(Teacher, 3, { degree: 'history' });
    let scienceTeachers = t.create(Teacher, 3, { degree: 'science' });
      
    let historyClasses = t.create(Class, 4)
    let scienceClasses = t.create(Class, 6);

    let students = t.create(Student, 50);
      
    historyClasses.join(historyTeachers, 'teacherIdentifier', { sequential: false, duplicates: true });
    scienceClasses.join(scienceTeachers, 'teacherIdentifier');

    let classes = t.combine(historyClasses, scienceClasses);

    let grades = t.cross(classes, students).to(Grade);

      
});
  
let testTask = ctx.task('test', t => {
    t.create(Teacher, 10);
});

//ctx.run(defaultTask, new SqlConnector('some connection string'));