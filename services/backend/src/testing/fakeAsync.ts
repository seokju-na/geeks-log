/// <reference path="../../node_modules/zone.js/dist/zone.js.d.ts" />
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-node';
import 'zone.js/dist/proxy';
import 'zone.js/dist/fake-async-test';
import 'zone.js/dist/sync-test';

/* tslint:disable */
// Source from: https://github.com/thymikee/jest-zone-patch

/**
 * Patch Jest's describe/test/beforeEach/afterEach functions so test code
 * always runs in a testZone (ProxyZone).
 */
if (Zone === undefined) {
  throw new Error('Missing: Zone (zone.js)');
}
if (jest === undefined) {
  throw new Error(
    'Missing: jest.\n' +
    'This patch must be included in a script called with ' +
    '`setupTestFrameworkScriptFile` in Jest config.',
  );
}
if (jest['__zone_patch__'] === true) {
  throw new Error('\'jest\' has already been patched with \'Zone\'.');
}

jest['__zone_patch__'] = true;
const SyncTestZoneSpec = Zone['SyncTestZoneSpec'];
const ProxyZoneSpec = Zone['ProxyZoneSpec'];

if (SyncTestZoneSpec === undefined) {
  throw new Error('Missing: SyncTestZoneSpec (zone.js/dist/sync-test)');
}
if (ProxyZoneSpec === undefined) {
  throw new Error('Missing: ProxyZoneSpec (zone.js/dist/proxy.js)');
}

const env = global;
const ambientZone = Zone.current;

// Create a synchronous-only zone in which to run `describe` blocks in order to
// raise an error if any asynchronous operations are attempted
// inside of a `describe` but outside of a `beforeEach` or `it`.
const syncZone = ambientZone.fork(new SyncTestZoneSpec('jest.describe'));

function wrapDescribeInZone(describeBody) {
  return function (...args) {
    return syncZone.run(describeBody, null, args);
  };
}

// Create a proxy zone in which to run `test` blocks so that the tests function
// can retroactively install different zones.
const testProxyZone = ambientZone.fork(new ProxyZoneSpec());

function wrapTestInZone(testBody) {
  if (testBody === undefined) {
    return;
  }
  return testBody.length === 0
    ? () => testProxyZone.run(testBody, null)
    : done => testProxyZone.run(testBody, null, [done]);
}

const bindDescribe = (originalJestFn) => function () {
  const eachArguments = arguments;
  return function (description, specDefinitions, timeout) {
    arguments[1] = wrapDescribeInZone(specDefinitions);
    return originalJestFn.apply(this, eachArguments).apply(
      this,
      arguments,
    );
  };
};

['xdescribe', 'fdescribe', 'describe'].forEach(methodName => {
  const originaljestFn = env[methodName];
  env[methodName] = function (description, specDefinitions, timeout) {
    arguments[1] = wrapDescribeInZone(specDefinitions);
    return originaljestFn.apply(
      this,
      arguments,
    );
  };
  env[methodName].each = bindDescribe(originaljestFn.each);
  if (methodName === 'describe') {
    env[methodName].only = env['fdescribe'];
    env[methodName].skip = env['xdescribe'];
    env[methodName].only.each = bindDescribe(originaljestFn.only.each);
    env[methodName].skip.each = bindDescribe(originaljestFn.skip.each);
  }
});

['xit', 'fit', 'xtest', 'test', 'it'].forEach(methodName => {
  const originaljestFn = env[methodName];
  env[methodName] = function (description, specDefinitions, timeout) {
    arguments[1] = wrapTestInZone(specDefinitions);
    return originaljestFn.apply(this, arguments);
  };
  // The revised method will be populated to the final each method, so we only declare the method
  // that in the new globals
  env[methodName].each = originaljestFn.each;
  if (methodName === 'test' || methodName === 'it') {
    env[methodName].only = env['fit'];
    env[methodName].only.each = originaljestFn.only.each;

    env[methodName].skip = env['xit'];
    env[methodName].skip.each = originaljestFn.skip.each;
  }
});

['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach(methodName => {
  const originaljestFn = env[methodName];
  env[methodName] = function (specDefinitions, timeout) {
    arguments[0] = wrapTestInZone(specDefinitions);
    return originaljestFn.apply(this, arguments);
  };
});

// Source from: https://github.com/angular/angular

const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
const fakeAsyncTestModule = _Zone && _Zone[_Zone.__symbol__('fakeAsyncTest')];

/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
export function resetFakeAsyncZone(): void {
  return fakeAsyncTestModule.resetFakeAsyncZone();
}

/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * Can be used to wrap inject() calls.
 *
 * @param fn
 * @returns The function wrapped to be executed in the fakeAsync zone
 *
 * @publicApi
 */
export function fakeAsync(fn: Function): (...args: any[]) => any {
  return fakeAsyncTestModule.fakeAsync(fn);
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @publicApi
 */
export function tick(millis: number = 0): void {
  return fakeAsyncTestModule.tick(millis);
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
 * draining the macrotask queue until it is empty. The returned value is the milliseconds
 * of time that would have been elapsed.
 *
 * @param maxTurns
 * @returns The simulated time elapsed, in millis.
 *
 * @publicApi
 */
export function flush(maxTurns?: number): number {
  return fakeAsyncTestModule.flush(maxTurns);
}

/**
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
export function discardPeriodicTasks(): void {
  return fakeAsyncTestModule.discardPeriodicTasks();
}

/**
 * Flush any pending microtasks.
 *
 * @publicApi
 */
export function flushMicrotasks(): void {
  return fakeAsyncTestModule.flushMicrotasks();
}
