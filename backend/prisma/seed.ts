import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GrandHR database...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'super_admin@grandhr.in';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminPassword) {
    console.error('ERROR: SUPER_ADMIN_PASSWORD env var is required.');
    console.error('Set it in backend/.env, e.g.: SUPER_ADMIN_PASSWORD=YourStrongPassword123');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (existing) {
    console.log('SUPER_ADMIN user already exists. Updating role...');
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: { role: 'SUPER_ADMIN', isActive: true },
    });
    console.log('SUPER_ADMIN role confirmed.');
  } else {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    const user = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        employee: {
          create: {
            employeeId: 'GRANDHR-001',
            firstName: 'Super',
            lastName: 'Admin',
            email: superAdminEmail,
            employmentStatus: 'ACTIVE',
          },
        },
      },
      include: { employee: true },
    });

    console.log('SUPER_ADMIN user created successfully:');
    console.log(`  Email: ${superAdminEmail}`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Employee ID: ${user.employee?.employeeId}`);
  }

  console.log('\n--- GrandHR Seed Complete ---');
  console.log(`Login at /hr/login with the email: ${superAdminEmail}`);
  console.log('Then navigate to /super-admin for the admin dashboard.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
