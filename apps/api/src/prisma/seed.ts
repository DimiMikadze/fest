import { PrismaClient, OrganizationRole } from '@prisma/client';
import * as dotenv from 'dotenv';

const prisma = new PrismaClient();

async function emptyTables() {
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser({
  auth0Id,
  email,
}: {
  auth0Id: string;
  email: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        auth0Id,
        email,
      },
    });
    console.log('createUser success, user: ', user);
    return user;
  } catch (error) {
    console.log('createUser failed, error:', error);
  }
}

async function createOrganization({ name }: { name: string }) {
  try {
    const organization = await prisma.organization.create({
      data: {
        name,
      },
    });
    console.log('createOrganization success, organization:', organization);
    return organization;
  } catch (error) {
    console.log('createOrganization failed, error:', error);
  }
}

async function createUserOrganizationAndOrganizationUser({
  auth0Id,
  email,
  userRole,
  organizationName,
}: {
  auth0Id: string;
  email: string;
  userRole: OrganizationRole;
  organizationName: string;
}) {
  try {
    const result = await prisma.user.create({
      data: {
        auth0Id,
        email,
        organizations: {
          create: [
            {
              role: userRole,
              organization: {
                create: {
                  name: organizationName,
                },
              },
            },
          ],
        },
      },
    });
    console.log('createUserOrganizationAndOrganizationUser success');
    return result;
  } catch (error) {
    console.log(
      'createUserOrganizationAndOrganizationUser failed, error:',
      error
    );
  }
}

async function createUserAndAssignToExistingOrganization({
  auth0Id,
  email,
  userRole,
  organizationId,
}: {
  auth0Id: string;
  email: string;
  userRole: OrganizationRole;
  organizationId: string;
}) {
  try {
    const result = await prisma.user.create({
      data: {
        auth0Id,
        email,
        organizations: {
          create: [
            {
              role: userRole,
              organization: {
                connect: {
                  id: organizationId,
                },
              },
            },
          ],
        },
      },
    });
    console.log('createUserAndAssignToExistingOrganization success');
    return result;
  } catch (error) {
    console.log(
      'createUserAndAssignToExistingOrganization failed, error:',
      error
    );
  }
}

async function createOrganizationAndAssignToExistingUser({
  organizationName,
  userRole,
  userId,
}: {
  organizationName: string;
  userRole: OrganizationRole;
  userId: string;
}) {
  try {
    const result = await prisma.organization.create({
      data: {
        name: organizationName,
        members: {
          create: [
            {
              role: userRole,
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          ],
        },
      },
    });
    console.log('createOrganizationAndAssignToExistingUser success');
    return result;
  } catch (error) {
    console.log(
      'createOrganizationAndAssignToExistingUser failed, error:',
      error
    );
  }
}

async function assignExistingUserToExistingOrganization({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  try {
    const result = await prisma.organizationUser.create({
      data: {
        role: 'Member',
        organization: {
          connect: {
            id: organizationId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    console.log(
      'assignExistingUserToExistingOrganization success:',
      JSON.stringify(result, null, 2)
    );
    return result;
  } catch (error) {
    console.log(
      'assignExistingUserToExistingOrganization failed, error:',
      error
    );
  }
}

async function findOrganizationAndItsMembers({
  organizationId,
}: {
  organizationId: string;
}) {
  try {
    const result = await prisma.organization.findMany({
      where: {
        id: organizationId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    console.log(
      'findOrganizationAndItsMembers',
      JSON.stringify(result, null, 2)
    );
    return result;
  } catch (error) {
    console.log('findOrganizationAndItsMembers failed, error:', error);
  }
}

async function findUserAndItsOrganizations({ userId }: { userId: string }) {
  try {
    const result = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });
    console.log(
      'findUserAndItsOrganizations success:',
      JSON.stringify(result, null, 2)
    );
    return result;
  } catch (error) {
    console.log('findUserAndItsOrganizations failed, error:', error);
  }
}

async function main() {
  dotenv.config();
  console.log('Seeding...');

  emptyTables();
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
