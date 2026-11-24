/**
 * LAYER    modules (composition root)
 * ROLE     The wiring contract between the app and its features.
 *          ISharedDependencies = every adapter built ONCE per process (by server.ts, or by
 *          tests/helpers/buildTestApp.ts with in-memory doubles). Typed as PORTS, so features never
 *          learn which implementation they got (Liskov + Dependency Inversion).
 * PATTERN  Feature module: a factory (deps) -> { name, basePath, router }. app.ts mounts each under /v1.
 * RULES    Add a repository here when a feature needs one (both its write and read port). Never put
 *          request-scoped state here.
 */
import type { Router } from 'express';
import type { IClock } from '../domain/interfaces/IClock';
import type { IGreetingReadRepository } from '../domain/interfaces/IGreetingReadRepository';
import type { IGreetingRepository } from '../domain/interfaces/IGreetingRepository';
import type { IIdGenerator } from '../domain/interfaces/IIdGenerator';
import type { ILogger } from '../domain/interfaces/ILogger';
import type { IPasswordHasher } from '../domain/interfaces/IPasswordHasher';
import type { IReadinessProbe } from '../domain/interfaces/IReadinessProbe';
import type { IUserReadRepository } from '../domain/interfaces/IUserReadRepository';
import type { IUserRepository } from '../domain/interfaces/IUserRepository';

export interface IRepositories {
  users: IUserRepository;
  userReads: IUserReadRepository;
  greetings: IGreetingRepository;
  greetingReads: IGreetingReadRepository;
}

export interface ISharedDependencies {
  logger: ILogger;
  clock: IClock;
  ids: IIdGenerator;
  hasher: IPasswordHasher;
  repositories: IRepositories;
  probes: IReadinessProbe[];
}

export interface IFeatureModule {
  /** Feature name, used in logs. */
  name: string;
  /** Mounted under /v1 + basePath (plural kebab-case resource, e.g. "/projects"). */
  basePath: string;
  router: Router;
}

export type FeatureModuleFactory = (deps: ISharedDependencies) => IFeatureModule;
