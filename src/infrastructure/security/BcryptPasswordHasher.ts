/**
 * LAYER    infrastructure/security (ADAPTER)
 * ROLE     Implements IPasswordHasher with bcrypt. The only file that imports bcrypt.
 * RULES    Cost factor injected (tests use a low cost for speed; production >= 12). Never log input.
 */
import bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../domain/interfaces/IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly cost = 12) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
