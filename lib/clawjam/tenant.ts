/**
 * CLAWJAM tenant authorization primitives.
 *
 * Call only after the application has authenticated the user. tenantId must
 * come from a server-validated route/session selection, never be trusted as
 * proof of access by itself.
 */
import { prisma } from '@/lib/prisma';

export class TenantAccessError extends Error {
  readonly statusCode = 403;
  constructor() {
    super('Tenant access denied');
    this.name = 'TenantAccessError';
  }
}

export async function requireTenantAccess(userId: string, tenantId: string) {
  if (!userId || !tenantId) throw new TenantAccessError();

  const membership = await prisma.tenantMember.findFirst({
    where: {
      userId,
      tenantId,
      status: 'active',
      tenant: { status: 'active' },
    },
    select: {
      role: true,
      tenant: { select: { id: true, slug: true, name: true, status: true } },
    },
  });

  if (!membership) throw new TenantAccessError();
  return { tenant: membership.tenant, role: membership.role };
}

export function requireTenantRole(
  role: string,
  allowed: readonly string[],
): void {
  if (!allowed.includes(role)) throw new TenantAccessError();
}
