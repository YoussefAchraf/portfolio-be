/**
 * LAYER    interface/controllers
 * ROLE     Operational endpoints. GET /health = liveness (process is up, NO I/O). GET /ready = readiness
 *          (every IReadinessProbe answers) -> 200 { status: "ready", checks } or 503 { status: "not_ready", checks }.
 * RULES    Unversioned (not under /v1) and not part of the feature contracts. Probes never throw.
 */
import type { Request, Response } from 'express';
import type { IReadinessProbe } from '../../domain/interfaces/IReadinessProbe';

export class HealthController {
  constructor(private readonly probes: IReadinessProbe[]) {}

  live(_req: Request, res: Response): void {
    res.status(200).json({ status: 'ok' });
  }

  async ready(_req: Request, res: Response): Promise<void> {
    const results = await Promise.all(this.probes.map(async (probe) => [probe.name, await probe.check()] as const));
    const checks = Object.fromEntries(results.map(([name, ok]) => [name, ok ? 'ok' : 'down']));
    const allOk = results.every(([, ok]) => ok);
    res.status(allOk ? 200 : 503).json({ status: allOk ? 'ready' : 'not_ready', checks });
  }
}
