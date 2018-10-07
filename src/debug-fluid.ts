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
    const historyTeachers = t.create(Teacher, 3, { degree: 'History' });
    const scienceTeachers = t.create(Teacher, 3, { degree: 'Science' });
    
    const historyClasses = t.create(Class, 4).using(historyTeachers);
    const scienceClasses = t.create(Class, 6).using(scienceTeachers);

    const students = t.create(Student, 50);
    
    // TODO: Make this better...
    const historyGrades = t.create(Grade).cross(students, historyClasses);
    const scienceGrades = t.create(Grade).cross(students, scienceClasses);

    let stream = t.stream();
    // returns readable object stream for each entity

    let data = t.data();
    // returns:
    // {
    //     teachers: [...historyTeachers.toArray(), ...scienceTeachers.toArray()],
    //     students: students.toArray(),
    //     classes: [...historyClasses.toArray(), ...scienceClasses.toArray()],
    //     grades: [...historyGrades.toArray(), ...scienceGrades.toArray()]
    // }

    // TODO: Determine API for external storage...
});

// const grades = t.cross(classes, students).to(Grade);