import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Setup script for enterprise features
 * Creates default company, admin user, and initial configurations
 */
async function setupEnterprise() {
  try {
    console.log('🚀 Setting up GrandHR Enterprise...\n');

    // Create default company
    console.log('📦 Creating default company...');
    let company = await prisma.company.findFirst({
      where: { name: 'Default Company' },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Default Company',
          domain: 'default',
          email: 'admin@company.com',
          isActive: true,
        },
      });
      console.log('✅ Default company created');
    } else {
      console.log('ℹ️  Default company already exists');
    }

    // Create default admin user
    console.log('\n👤 Creating default admin user...');
    const adminEmail = 'admin@grandhr.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
          employee: {
            create: {
              employeeId: 'ADMIN001',
              firstName: 'Admin',
              lastName: 'User',
              department: 'Administration',
              designation: 'System Administrator',
              salary: 0,
            },
          },
        },
      });
      console.log('✅ Default admin user created');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
      console.log('   ⚠️  Please change the password after first login!');
    } else {
      console.log('ℹ️  Default admin user already exists');
    }

    // Create default configurations
    console.log('\n⚙️  Creating default configurations...');
    
    const defaultConfigs = [
      {
        key: 'PAYROLL_CONFIG',
        category: 'PAYROLL',
        value: {
          allowances: {
            hra: 0.4,
            transport: 0.1,
            medical: 0.05,
          },
          deductions: {
            pf: 0.12,
            esi: 0.0175,
            professionalTax: 200,
          },
          taxSlabs: [
            { min: 0, max: 250000, rate: 0 },
            { min: 250000, max: 500000, rate: 0.05 },
            { min: 500000, max: 1000000, rate: 0.20 },
            { min: 1000000, max: Infinity, rate: 0.30 },
          ],
        },
        description: 'Default payroll configuration',
      },
      {
        key: 'LEAVE_CONFIG',
        category: 'LEAVE',
        value: {
          sickLeave: 12,
          casualLeave: 12,
          earnedLeave: 15,
          maternityLeave: 26,
          paternityLeave: 7,
        },
        description: 'Default leave policy',
      },
      {
        key: 'HOLIDAYS',
        category: 'GENERAL',
        value: [
          { date: '2024-01-01', name: 'New Year' },
          { date: '2024-01-26', name: 'Republic Day' },
          { date: '2024-08-15', name: 'Independence Day' },
          { date: '2024-10-02', name: 'Gandhi Jayanti' },
          { date: '2024-12-25', name: 'Christmas' },
        ],
        description: 'Company holidays',
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await prisma.configuration.findUnique({
        where: {
          companyId_key: {
            companyId: company.id,
            key: config.key,
          },
        },
      });

      if (!existing) {
        await prisma.configuration.create({
          data: {
            companyId: company.id,
            ...config,
          },
        });
        console.log(`✅ Created configuration: ${config.key}`);
      } else {
        console.log(`ℹ️  Configuration already exists: ${config.key}`);
      }
    }

    // Create default automation jobs
    console.log('\n🤖 Creating default automation jobs...');
    
    const defaultJobs = [
      {
        name: 'Monthly Payroll Processing',
        type: 'AUTO_PAYROLL',
        schedule: '0 0 1 * *', // 1st of every month
        config: {},
      },
      {
        name: 'Daily Attendance Reminder',
        type: 'AUTO_REMINDER',
        schedule: '0 9 * * *', // 9 AM daily
        config: {},
      },
      {
        name: 'Weekly Leave Balance Update',
        type: 'AUTO_LEAVE_BALANCE',
        schedule: '0 0 * * 0', // Every Sunday
        config: {},
      },
    ];

    for (const job of defaultJobs) {
      const existing = await prisma.automationJob.findFirst({
        where: {
          companyId: company.id,
          name: job.name,
        },
      });

      if (!existing) {
        const nextRun = calculateNextRun(job.schedule);
        await prisma.automationJob.create({
          data: {
            companyId: company.id,
            ...job,
            nextRun,
          },
        });
        console.log(`✅ Created automation job: ${job.name}`);
      } else {
        console.log(`ℹ️  Automation job already exists: ${job.name}`);
      }
    }

    console.log('\n✅ Enterprise setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login with admin credentials');
    console.log('   2. Change default password');
    console.log('   3. Update company information');
    console.log('   4. Configure automation jobs');
    console.log('   5. Add employees and start using the system');
  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function calculateNextRun(schedule: string): Date {
  const now = new Date();
  const next = new Date(now);

  if (schedule === '0 0 1 * *') {
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(0, 0, 0, 0);
  } else if (schedule === '0 9 * * *') {
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
  } else if (schedule === '0 0 * * 0') {
    const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
    next.setDate(next.getDate() + daysUntilSunday);
    next.setHours(0, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }

  return next;
}

// Run setup
setupEnterprise()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });

