import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

/**
 * Ensures the user has a valid authenticated identity via Firebase OIDC.
 * Returns the verified user identity.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: A valid identity token is required.");
  }
  return identity;
}

/**
 * Ensures the user has a valid user profile record in the database.
 * Returns the local user document.
 */
export async function requireUserProfile(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  const user = await ctx.db
    .query('users')
    .withIndex('by_uid', (q) => q.eq('uid', identity.subject))
    .first();

  if (!user) {
    throw new Error("Unauthorized: User profile does not exist on this platform.");
  }
  return user;
}

/**
 * Ensures the user is authorized for a specific platform and is active.
 * Returns the platform access record.
 */
export async function requirePlatformAccess(ctx: QueryCtx | MutationCtx, platform: string = 'college_cbt') {
  const identity = await requireAuth(ctx);
  
  const access = await ctx.db
    .query('platformAccess')
    .withIndex('by_platform_user', (q) => q.eq('platform', platform).eq('userId', identity.subject))
    .first();

  if (!access || access.status !== 'active') {
    throw new Error(`Unauthorized: No active access permissions for platform '${platform}'.`);
  }

  if (access.expiresAt < Date.now()) {
    throw new Error(`Unauthorized: Platform access for '${platform}' has expired.`);
  }

  return access;
}

/**
 * Enforces admin-only permissions for sensitive mutations and queries.
 * Returns the local admin user profile document.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUserProfile(ctx);
  if (user.role !== 'admin') {
    throw new Error("Unauthorized: Elevated administrator privileges are required.");
  }
  return user;
}

/**
 * Validate admin permission via either a session token secret or Firebase Auth admin role.
 */
export async function validateAdminAuth(ctx: QueryCtx | MutationCtx, adminSecret?: string) {
  const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "eWin$uPerAdm!n$ecr3t2026#EWIN@project";
  if (adminSecret === ADMIN_SESSION_SECRET) {
    return true;
  }
  try {
    await requireAdmin(ctx);
    return true;
  } catch (err) {
    throw new Error("Unauthorized: Elevated administrator privilege is required.");
  }
}

