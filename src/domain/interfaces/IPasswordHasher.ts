/**
 * LAYER    domain/interfaces (PORT - cross-cutting concern)
 * ROLE     Hashing without knowing the algorithm. Implemented by infrastructure/security/BcryptPasswordHasher.ts.
 * RULES    The domain never imports bcrypt/argon2; swapping the algorithm touches one adapter only.
 */
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
