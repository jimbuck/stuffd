import { test } from 'ava';
import { TaskRunner } from './task-runner';

test(`Task adds the task to the cache`, t => { 
  const expectedTaskName = 'test';
  const expectedTaskHandler = () => { console.log('this is the one') };

  const taskRunner = new TaskRunner();

  taskRunner.task(expectedTaskName, expectedTaskHandler);

  t.is(taskRunner['_tasks'][expectedTaskName], expectedTaskHandler);
});

test(`Task overwrites previous declared tasks`, t => { 
  const expectedTaskName = 'test';
  const overwrittenTaskHandler = () => { console.log('this is not the one') };
  const expectedTaskHandler = () => { console.log('this is the one') };

  const taskRunner = new TaskRunner();

  taskRunner.task(expectedTaskName, overwrittenTaskHandler);
  t.is(taskRunner['_tasks'][expectedTaskName], overwrittenTaskHandler);

  taskRunner.task(expectedTaskName, expectedTaskHandler);
  t.is(taskRunner['_tasks'][expectedTaskName], expectedTaskHandler);
});

test(`Run requires a task name`, async (t) => { 
    
  const taskRunner = new TaskRunner();

  await t.throws(taskRunner.run(null));
});

test(`Run executes the specified task`, async (t) => { 
  t.plan(1);
    
  const taskRunner = new TaskRunner();

  taskRunner.task('test', () => {
    t.pass();
  });

  await taskRunner.run('test');
});

test(`Run throws on unspecified tasks`, async t => { 
  const taskRunner = new TaskRunner();

  await t.throws(taskRunner.run('doesNotExist'));
});
