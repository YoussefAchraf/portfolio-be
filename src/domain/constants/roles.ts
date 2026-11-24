/**
 * LAYER    domain/constants
 * ROLE     Closed sets of business values (enums as const arrays). Mirrors contracts/domain-model.md.
 * RULES    Plain data only - no logic, no imports outside domain. The frontend mirrors public enums.
 */
export const ROLES = ['admin', 'member'] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ['active', 'disabled'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
