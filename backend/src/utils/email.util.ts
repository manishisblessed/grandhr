import nodemailer from 'nodemailer';

/**
 * Email Utility - All confirmations and system emails sent from noreply@grandhr.in
 * Made by Shah Works - www.shahworks.com
 */

/** All transactional/confirmation emails use this sender. Set EMAIL_FROM in .env to override. */
export const NOREPLY_FROM = process.env.EMAIL_FROM || 'noreply@grandhr.in';

// Create reusable transporter
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

/**
 * Send employee welcome email with credentials
 */
export const sendEmployeeWelcomeEmail = async (
  employeeEmail: string,
  employeeName: string,
  password: string,
  employeeId: string
) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `GrandHR <${NOREPLY_FROM}>`,
      to: employeeEmail,
      subject: 'Welcome to GrandHR - Your Account Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .credential-item { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to GrandHR!</h1>
            </div>
            <div class="content">
              <p>Dear ${employeeName},</p>
              
              <p>Welcome to GrandHR! Your account has been created successfully. You can now access the HR management system using the credentials below:</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="label">Email:</span> ${employeeEmail}
                </div>
                <div class="credential-item">
                  <span class="label">Password:</span> ${password}
                </div>
                <div class="credential-item">
                  <span class="label">Employee ID:</span> ${employeeId}
                </div>
              </div>
              
              <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/hr/login" class="button">Login to GrandHR</a>
              </div>
              
              <p>If you have any questions or need assistance, please contact your HR department or support team.</p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} GrandHR. All rights reserved. | Shah Works</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to GrandHR!

Dear ${employeeName},

Your account has been created successfully. Here are your login credentials:

Email: ${employeeEmail}
Password: ${password}
Employee ID: ${employeeId}

Please login at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/hr/login

Important: Please change your password after your first login.

If you have any questions, please contact your HR department.

© ${new Date().getFullYear()} GrandHR. All rights reserved. | Shah Works
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Employee welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending employee welcome email:', error);
    // Don't throw error - email failure shouldn't break employee creation
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification (generic)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `GrandHR <${NOREPLY_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a document (e.g. offer letter) to a candidate's email from noreply@grandhr.in
 * Optionally attach a PDF.
 */
export const sendDocumentEmail = async (
  to: string,
  subject: string,
  html: string,
  pdfBase64?: string,
  attachmentFilename: string = 'document.pdf'
) => {
  try {
    const transporter = createTransporter();
    const attachments: nodemailer.SendMailOptions['attachments'] = [];
    if (pdfBase64) {
      attachments.push({
        filename: attachmentFilename,
        content: Buffer.from(pdfBase64, 'base64'),
      });
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `GrandHR <${NOREPLY_FROM}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),
      attachments: attachments.length ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Document email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending document email:', error);
    return { success: false, error: error.message };
  }
};

