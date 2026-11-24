/** LAYER interface/controllers - maps the public profile query to HTTP. */
import type { Request, Response } from 'express';
import type { GetPublicProfileUseCase } from '../../use-cases/profile/queries/GetPublicProfileUseCase';
import { validatedInput } from '../middlewares/validateRequestMiddleware';
import type { ShowProfileQuery } from '../validation/profileSchemas';

export class ProfileController {
  constructor(private readonly getProfile: GetPublicProfileUseCase) {}

  async show(_req: Request, res: Response): Promise<void> {
    const { lang } = validatedInput<ShowProfileQuery>(res, 'query');
    res.status(200).json(await this.getProfile.execute(lang));
  }
}
