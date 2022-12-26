import { Prisma, User, OrganizationRole } from '@prisma/client';
import { USER_RELATIONS } from '../';
import { isNotEmptyArray } from '@fest/shared';

export interface OrganizationTransformed {
  id: string;
  role: OrganizationRole;
  assignedAt: Date;
  organizationId: string;
  name: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof USER_RELATIONS;
}>;

export interface AuthUser extends User {
  currentOrganization?: OrganizationTransformed;
  organizations?: OrganizationTransformed[];
}

/**
 * Converts User, Organization, and OrganizationUsers data into more readable object.
 * Creates currentOrganization field on authUser object.
 * Removes duplicated data.
 */
export const transformAuthUserPayload = (authUser: UserWithRelations) => {
  if (!authUser) return null;
  if (!isNotEmptyArray(authUser?.organizations)) return authUser;

  const organizations = <OrganizationTransformed[]>[];
  authUser.organizations.forEach((org) => {
    // Remove duplicated data
    delete org.userId;
    delete org.organizationId;
    const organizationData = org.organization;
    delete org.organization;

    organizations.push({ ...org, ...organizationData });
  });

  // Find and attach currentOrganization on user
  const currentOrganization = organizations.find(
    (org: OrganizationTransformed) => org.id === authUser.currentOrganizationId
  );

  // Delete duplicate data
  delete authUser.organizations;
  delete authUser.currentOrganizationId;

  const user: AuthUser = {
    ...authUser,
    organizations,
    currentOrganization,
  };

  return user;
};
