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

ctx.run(async (t) => {
    const historyTeachersRef = t.create(Teacher, 3, { degree: 'History' });
    const scienceTeachersRef = t.create(Teacher, 3, { degree: 'Science' });
    
    const historyClassesRef = t.create(Class, 4).using(historyTeachersRef);
    const scienceClassesRef = t.create(Class, 6).using(scienceTeachersRef);

    const studentsRef = t.create(Student, 50);
    
    const historyGrades = t.create(Grade).cross(studentsRef, historyClassesRef);
    const scienceGrades = t.create(Grade).cross(studentsRef, scienceClassesRef);

    let stream = t.toStream();
    // returns readable object stream for each entity

    let data = t.data();
    // returns:
    // {
    //     teachers: [...],
    //     students: [...],
    //     classes: [...],
    //     grades: [...]
    // }

    // TODO: Determine API for external storage...
});