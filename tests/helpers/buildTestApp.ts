/**
 * TEST HELPER  Builds the REAL Express app (src/app.ts) with in-memory dependencies. e2e tests use it with
 * supertest: every middleware, route, controller, use case and presenter runs for real; only the
 * adapters at the edge are swapped. Returns the doubles so tests can arrange data and simulate outages.
 */
import type { Express } from 'express';
import { InMemoryGreetingStore } from './inMemoryGreetingStore';
import { InMemoryUserStore } from './inMemoryUserStore';
import { FixedClock, SequenceIds, SwitchProbe, fakeHasher, silentLogger } from './testDoubles';
import { buildApp } from '../../src/app';
import type { ISharedDependencies } from '../../src/modules/types';

export interface ITestApp {
  app: Express;
  deps: ISharedDependencies;
  store: InMemoryUserStore;
  greetings: InMemoryGreetingStore;
  clock: FixedClock;
  probe: SwitchProbe;
}

export function buildTestApp(options: { demoRoutes?: boolean } = {}): ITestApp {
  const store = new InMemoryUserStore();
  const greetings = new InMemoryGreetingStore();
  const clock = new FixedClock();
  const probe = new SwitchProbe('postgres');
  const deps: ISharedDependencies = {
    logger: silentLogger,
    clock,
    ids: new SequenceIds(),
    hasher: fakeHasher,
    repositories: { users: store, userReads: store, greetings, greetingReads: greetings },
    probes: [probe],
  };
  const app = buildApp(deps, {
    corsOrigins: ['http://localhost:3000'],
    requestBodyLimit: '100kb',
    demoRoutes: options.demoRoutes ?? true,
  });
  return { app, deps, store, greetings, clock, probe };
}
