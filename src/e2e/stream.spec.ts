import { test } from 'ava';
import { Stuffd, Context } from '..';

const EMPTY_STRING = '';

test(`Context#stream() returns a stream of each object in order`, async (t) => {
  const expectedType = 'Thing';
  const expectedCount = 3;
  const Thing = Stuffd.create(expectedType).key('id', id => id.guid()).build();
  const ctx = new Context();
  let expectedItems = ctx.create(Thing, expectedCount);
  let acutalItems = await streamToArray(ctx.stream());
  t.is(acutalItems.length, expectedCount);
  t.deepEqual(acutalItems, expectedItems.map(value => ({ type: expectedType, value })));
});

test(`Context#stream(false) returns a stream of json of each object in order`, async (t) => {
  const expectedType = 'Thing';
  const expectedCount = 3;
  const Thing = Stuffd.create(expectedType).key('id', id => id.guid()).build();
  const ctx = new Context();
  let expectedItems = ctx.create(Thing, expectedCount);
  t.is(expectedItems.length, expectedCount);
  let actualOutput = await streamToString(ctx.stream(false));
  t.is(actualOutput.split('\n').filter(line => !!(line || EMPTY_STRING).trim()).length, expectedCount, actualOutput);
  t.is(actualOutput, expectedItems.map(value => JSON.stringify({ type: expectedType, value })).join('\n') + '\n');
});

function streamToArray<T>(stream: NodeJS.ReadableStream): Promise<T[]> {
  return new Promise<T[]>((resolve) => {
    let results: T[] = [];

    stream.on('data', results.push.bind(results));
    stream.on('end', () => resolve(results));
  });
}

function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise<string>((resolve) => {
    let results: string = '';

    stream.on('data', txt => results += txt);
    stream.on('end', () => resolve(results));
  });
}