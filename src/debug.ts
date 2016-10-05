import { Context } from './lib';

let ctx = new Context();

let Person = ctx.model('person')
  .prop('FirstName', fn => fn.type(String))
  .prop('LastName', ln => ln.type(String))
  .prop('DateOfBirth', dob => dob.type(Date));

let Teacher = ctx.model('teacher')
  .inherits(Person)
  .name('Teachers')
  .prop('room', r => r.name('Room').type(Number).min(100).max(300));

let Student = ctx.model('student')
  .inherits(Person)
  .name('Students')
  .prop('grades', g => g.name('Grades').array((Number)))
  .prop('currentGrade', cg => cg.name('CurrentGrade').sum('Grades'));
  
// ctx.task('default')
//   .make(3, Teacher)
//   .make(10, Student);

let def = ctx.build();

console.log(def);