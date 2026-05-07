import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    name: 'Standard Offer Letter',
    type: 'OFFER_LETTER',
    description: 'A modern, friendly offer letter ready to personalise.',
    emailSubject: 'Your offer from {{company.name}}',
    emailIntro: 'We are delighted to share your offer of employment.',
    htmlBody: `
      <h1>Offer of Employment</h1>
      <p><strong>Date:</strong> {{date.today}}</p>
      <p>Dear {{employee.fullName}},</p>
      <p>It is our pleasure to offer you the position of <strong>{{employee.designation}}</strong> at <strong>{{company.name}}</strong>.</p>
      <p>Your annual CTC will be <strong>{{employee.salary}}</strong>, and your tentative joining date is <strong>{{employee.joiningDate}}</strong>.</p>
      <p>We are excited to have you on the team and look forward to a fruitful association.</p>
      <br/>
      <p>Warm regards,<br/>HR Team<br/>{{company.name}}</p>
    `,
  },
  {
    name: 'Appointment Letter (Permanent)',
    type: 'APPOINTMENT_LETTER',
    description: 'Confirms the candidate\u2019s appointment after offer acceptance.',
    emailSubject: 'Your appointment letter from {{company.name}}',
    emailIntro: 'Welcome aboard! Please find your appointment letter below.',
    htmlBody: `
      <h1>Letter of Appointment</h1>
      <p><strong>Date:</strong> {{date.today}}</p>
      <p>Dear {{employee.fullName}},</p>
      <p>With reference to your acceptance of our offer, we are pleased to confirm your appointment as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department.</p>
      <p>Your appointment is effective from <strong>{{employee.joiningDate}}</strong>. Your CTC will be <strong>{{employee.salary}}</strong> per annum.</p>
      <p>You will be governed by the policies and procedures of {{company.name}} as amended from time to time.</p>
      <br/>
      <p>For {{company.name}},<br/>HR Team</p>
    `,
  },
  {
    name: 'Salary Increment Letter',
    type: 'INCREMENT_LETTER',
    description: 'Communicates a salary revision to the employee.',
    emailSubject: 'Salary revision \u2014 effective {{date.today}}',
    emailIntro: 'Congratulations on your hard work \u2014 here is your revision letter.',
    htmlBody: `
      <h1>Salary Revision</h1>
      <p><strong>Date:</strong> {{date.today}}</p>
      <p>Dear {{employee.fullName}},</p>
      <p>In recognition of your contribution as <strong>{{employee.designation}}</strong>, we are pleased to revise your annual CTC to <strong>{{employee.salary}}</strong>, effective {{date.today}}.</p>
      <p>We thank you for your commitment and look forward to your continued contributions.</p>
      <br/>
      <p>For {{company.name}},<br/>HR Team</p>
    `,
  },
  {
    name: 'Warning Letter',
    type: 'WARNING_LETTER',
    description: 'A formal written warning template.',
    emailSubject: 'Formal notice from HR',
    emailIntro: 'Please review the formal notice attached below.',
    htmlBody: `
      <h1>Formal Warning</h1>
      <p><strong>Date:</strong> {{date.today}}</p>
      <p>Dear {{employee.fullName}} ({{employee.employeeId}}),</p>
      <p>This letter serves as a formal warning concerning your conduct/performance. Please treat this letter as a serious advisory and rectify the same with immediate effect.</p>
      <p>Failure to comply may invite further disciplinary action as per company policy.</p>
      <br/>
      <p>For {{company.name}},<br/>HR Team</p>
    `,
  },
  {
    name: 'Experience Letter',
    type: 'EXPERIENCE_LETTER',
    description: 'Issued upon employee separation.',
    emailSubject: 'Your experience letter from {{company.name}}',
    emailIntro: 'Best wishes for your future. Please find your experience letter below.',
    htmlBody: `
      <h1>Experience Letter</h1>
      <p><strong>Date:</strong> {{date.today}}</p>
      <p>This is to certify that <strong>{{employee.fullName}}</strong> ({{employee.employeeId}}) was employed with <strong>{{company.name}}</strong> as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department.</p>
      <p>During the tenure with us, the employee was found to be diligent, dependable and result-oriented.</p>
      <p>We wish them success in all future endeavours.</p>
      <br/>
      <p>For {{company.name}},<br/>HR Team</p>
    `,
  },
  {
    name: 'Relieving Letter',
    type: 'RELIEVING_LETTER',
    description: 'Sent on the last working day.',
    emailSubject: 'Your relieving letter from {{company.name}}',
    emailIntro: 'Please find your relieving letter below. All the best!',
    htmlBody: `
      <h1>Relieving Letter</h1>
      <p><strong>Date:</strong> {{date.today}}</p>
      <p>Dear {{employee.fullName}},</p>
      <p>With reference to your resignation, we confirm that you have been relieved from your duties as <strong>{{employee.designation}}</strong> with effect from {{date.today}}.</p>
      <p>We thank you for your contributions and wish you success in your next chapter.</p>
      <br/>
      <p>For {{company.name}},<br/>HR Team</p>
    `,
  },
];

async function main() {
  for (const t of TEMPLATES) {
    const exists = await prisma.documentTemplate.findFirst({
      where: { name: t.name, source: 'BUILT_IN', companyId: null },
    });
    if (exists) {
      console.log(`Skipped (exists): ${t.name}`);
      continue;
    }
    const tags = Array.from(new Set(Array.from(t.htmlBody.matchAll(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g)).map((m) => m[1])));
    await prisma.documentTemplate.create({
      data: {
        name: t.name,
        type: t.type,
        description: t.description,
        htmlBody: t.htmlBody.trim(),
        emailSubject: t.emailSubject,
        emailIntro: t.emailIntro,
        source: 'BUILT_IN',
        isDefault: true,
        mergeTags: tags,
      },
    });
    console.log(`Seeded: ${t.name}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
