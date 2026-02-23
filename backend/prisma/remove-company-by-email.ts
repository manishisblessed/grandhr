/**
 * One-time script: Remove a company (and its users/employees) by email or domain
 * so the same company can be registered again via onboarding.
 *
 * Usage: npx tsx prisma/remove-company-by-email.ts [email_or_domain]
 * Example: npx tsx prisma/remove-company-by-email.ts support@grandhr.in
 * Example: npx tsx prisma/remove-company-by-email.ts grandhr.in
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emailOrDomain = process.argv[2] || 'support@grandhr.in';

  const isEmail = emailOrDomain.includes('@');
  const company = await prisma.company.findFirst({
    where: isEmail
      ? { email: emailOrDomain }
      : { domain: emailOrDomain },
    include: {
      users: { select: { id: true, email: true } },
      employees: { select: { id: true } },
    },
  });

  if (!company) {
    console.log(`No company found with ${isEmail ? 'email' : 'domain'}: ${emailOrDomain}`);
    process.exit(1);
  }

  console.log(`Found company: ${company.name} (id: ${company.id})`);
  console.log(`  Email: ${company.email}, Domain: ${company.domain}`);
  console.log(`  Users: ${company.users.length}, Employees: ${company.employees.length}`);

  const employeeIds = company.employees.map((e) => e.id);
  const userIds = company.users.map((u) => u.id);

  await prisma.$transaction(async (tx) => {
    if (employeeIds.length > 0) {
      await tx.leave.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.leaveBalance.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.attendance.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.attendanceRegularization.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.attendanceSummary.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.payroll.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.salaryStructure.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.document.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.generatedDocument.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.employeeLifecycleEvent.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.goal.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.performanceReview.deleteMany({ where: { employeeId: { in: employeeIds } } });
      await tx.performanceReview.deleteMany({ where: { reviewerId: { in: employeeIds } } });
      await tx.employee.deleteMany({ where: { companyId: company.id } });
    }

    await tx.generatedDocument.deleteMany({ where: { companyId: company.id } });
    await tx.invoice.deleteMany({
      where: { subscription: { companyId: company.id } },
    });
    await tx.subscriptionAddOn.deleteMany({
      where: { subscription: { companyId: company.id } },
    });
    await tx.subscription.deleteMany({ where: { companyId: company.id } });
    await tx.customPlanPricing.deleteMany({ where: { companyId: company.id } });
    await tx.holiday.deleteMany({ where: { companyId: company.id } });
    await tx.shift.deleteMany({ where: { companyId: company.id } });
    await tx.leavePolicy.deleteMany({ where: { companyId: company.id } });
    await tx.payrollCalendar.deleteMany({ where: { companyId: company.id } });
    await tx.policy.deleteMany({ where: { companyId: company.id } });
    await tx.location.deleteMany({ where: { companyId: company.id } });
    await tx.department.deleteMany({ where: { companyId: company.id } });
    await tx.designation.deleteMany({ where: { companyId: company.id } });
    await tx.configuration.deleteMany({ where: { companyId: company.id } });
    await tx.automationJob.deleteMany({ where: { companyId: company.id } });
    await tx.workflow.deleteMany({ where: { companyId: company.id } });
    await tx.customField.deleteMany({ where: { companyId: company.id } });
    await tx.report.deleteMany({ where: { companyId: company.id } });
    await tx.integration.deleteMany({ where: { companyId: company.id } });
    await tx.role.deleteMany({ where: { companyId: company.id } });
    await tx.reviewCycle.deleteMany({ where: { companyId: company.id } });
    await tx.featureToggle.deleteMany({ where: { companyId: company.id } });

    const candidateIds = await tx.candidate.findMany({ where: { companyId: company.id }, select: { id: true } }).then((r) => r.map((c) => c.id));
    if (candidateIds.length > 0) {
      await tx.interview.deleteMany({ where: { candidateId: { in: candidateIds } } });
      await tx.candidateStageHistory.deleteMany({ where: { candidateId: { in: candidateIds } } });
    }
    await tx.candidate.deleteMany({ where: { companyId: company.id } });
    await tx.jobRequisition.deleteMany({ where: { companyId: company.id } });

    await tx.ticketReply.deleteMany({ where: { ticket: { companyId: company.id } } });
    await tx.supportTicket.deleteMany({ where: { companyId: company.id } });

    if (userIds.length > 0) {
      await tx.notification.deleteMany({ where: { userId: { in: userIds } } });
      await tx.notificationPreference.deleteMany({ where: { userId: { in: userIds } } });
      await tx.activityLog.deleteMany({ where: { userId: { in: userIds } } });
      await tx.auditLog.deleteMany({ where: { companyId: company.id } });
      await tx.userRolePermission.deleteMany({ where: { userId: { in: userIds } } });
      await tx.user.deleteMany({ where: { companyId: company.id } });
    }

    await tx.company.delete({ where: { id: company.id } });
  });

  console.log(`\nDone. Company "${company.name}" and all related data have been removed.`);
  console.log('You can now register again via /hr/company-onboarding with the same email/domain.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
