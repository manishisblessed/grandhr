import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Chatbot Service - Multiple specialized chatbots for different purposes
 * Made by Shah Works - www.shahworks.com
 */

export enum ChatbotType {
  HR_ASSISTANT = 'HR_ASSISTANT',      // General HR questions and guidance
  PAYROLL_BOT = 'PAYROLL_BOT',        // Payroll and salary queries
  LEAVE_BOT = 'LEAVE_BOT',            // Leave policies and requests
  ATTENDANCE_BOT = 'ATTENDANCE_BOT',  // Attendance tracking help
  GENERAL_SUPPORT = 'GENERAL_SUPPORT' // General support and FAQs
}

interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  actionRequired?: boolean;
  actionType?: string;
  actionData?: any;
}

export class ChatbotService {
  /**
   * Process message from user and return appropriate response
   */
  static async processMessage(
    userId: string,
    companyId: string | null,
    chatbotType: ChatbotType,
    message: string
  ): Promise<ChatbotResponse> {
    const normalizedMessage = message.toLowerCase().trim();

    try {
      switch (chatbotType) {
        case ChatbotType.HR_ASSISTANT:
          return await this.handleHRAssistant(userId, companyId, normalizedMessage);
        case ChatbotType.PAYROLL_BOT:
          return await this.handlePayrollBot(userId, companyId, normalizedMessage);
        case ChatbotType.LEAVE_BOT:
          return await this.handleLeaveBot(userId, companyId, normalizedMessage);
        case ChatbotType.ATTENDANCE_BOT:
          return await this.handleAttendanceBot(userId, companyId, normalizedMessage);
        case ChatbotType.GENERAL_SUPPORT:
          return await this.handleGeneralSupport(userId, companyId, normalizedMessage);
        default:
          return {
            message: "I'm not sure how to help with that. Please try asking about HR, payroll, leaves, or attendance.",
            suggestions: ['How do I apply for leave?', 'When is payroll processed?', 'How do I check my attendance?']
          };
      }
    } catch (error: any) {
      console.error('Chatbot error:', error);
      return {
        message: "I'm sorry, I encountered an error. Please try again or contact support.",
        suggestions: ['Contact support', 'Try again']
      };
    }
  }

  /**
   * HR Assistant - General HR questions
   */
  private static async handleHRAssistant(
    userId: string,
    companyId: string | null,
    message: string
  ): Promise<ChatbotResponse> {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    const userRole = user?.role || 'EMPLOYEE';
    const isEmployee = userRole === 'EMPLOYEE';

    // Common HR questions
    if (message.includes('profile') || message.includes('information') || message.includes('details')) {
      if (isEmployee && user?.employee) {
        return {
          message: `Here's your profile information:\n\nName: ${user.employee.firstName} ${user.employee.lastName}\nEmployee ID: ${user.employee.employeeId}\nDepartment: ${user.employee.department || 'Not set'}\nDesignation: ${user.employee.designation || 'Not set'}\n\nYou can view your full profile in the Employees section.`,
          suggestions: ['View full profile', 'Update profile', 'View documents'],
          actionRequired: true,
          actionType: 'navigate',
          actionData: { path: '/hr/employees' }
        };
      }
      return {
        message: 'You can view employee profiles in the Employees section. Would you like to search for a specific employee?',
        suggestions: ['View all employees', 'Search employee']
      };
    }

    if (message.includes('document') || message.includes('letter') || message.includes('slip')) {
      return {
        message: 'You can generate various HR documents:\n\n• Offer Letters\n• Appointment Letters\n• Increment Letters\n• Relieving Letters\n• Termination Letters\n• Salary Slips\n\nAll documents can be generated from the Documents section.',
        suggestions: ['Generate offer letter', 'Generate salary slip', 'View all documents'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/documents' }
      };
    }

    if (message.includes('help') || message.includes('how') || message.includes('guide')) {
      return {
        message: 'I can help you with:\n\n• Employee Management\n• Leave Requests\n• Attendance Tracking\n• Payroll Information\n• Document Generation\n• Company Policies\n\nWhat would you like to know more about?',
        suggestions: ['How to add employee?', 'How to process payroll?', 'How to approve leaves?']
      };
    }

    if (message.includes('policy') || message.includes('rule') || message.includes('guideline')) {
      return {
        message: 'Company policies are managed by administrators. You can view specific policies in the Configuration section. For detailed policy information, please contact your HR department.',
        suggestions: ['View configurations', 'Contact HR', 'View company settings']
      };
    }

    // Default response
    return {
      message: "I'm your HR Assistant! I can help you with employee management, documents, policies, and general HR questions. What would you like to know?",
      suggestions: ['View employees', 'Generate documents', 'Check policies', 'Get help']
    };
  }

  /**
   * Payroll Bot - Payroll and salary queries
   */
  private static async handlePayrollBot(
    userId: string,
    companyId: string | null,
    message: string
  ): Promise<ChatbotResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    const userRole = user?.role || 'EMPLOYEE';
    const isEmployee = userRole === 'EMPLOYEE';

    // Get recent payrolls
    if (message.includes('salary') || message.includes('payroll') || message.includes('payslip')) {
      if (isEmployee && user?.employee) {
        const recentPayroll = await prisma.payroll.findFirst({
          where: { employeeId: user.employee.id },
          orderBy: { createdAt: 'desc' }
        });

        if (recentPayroll) {
          const grossSalary = recentPayroll.baseSalary + (recentPayroll.allowances || 0);
          const monthName = new Date(recentPayroll.year, recentPayroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          return {
            message: `Your latest payroll information:\n\nPeriod: ${monthName}\nGross Salary: ₹${grossSalary}\nDeductions: ₹${recentPayroll.deductions || 0}\nNet Salary: ₹${recentPayroll.netSalary}\n\nYou can view all your payslips in the Payroll section.`,
            suggestions: ['View all payslips', 'Download payslip', 'View payroll history'],
            actionRequired: true,
            actionType: 'navigate',
            actionData: { path: '/hr/payroll' }
          };
        }
        return {
          message: 'No payroll records found yet. Payroll is typically processed monthly. Contact your HR for more information.',
          suggestions: ['Contact HR', 'View payroll section']
        };
      }

      // For HR/Admin
      const pendingPayrolls = await prisma.payroll.count({
        where: {
          status: 'PENDING',
          employee: companyId ? {
            companyId: companyId
          } : undefined
        }
      });

      return {
        message: `Payroll Management:\n\n• Pending Payrolls: ${pendingPayrolls}\n• You can process payroll for all employees\n• Generate payslips automatically\n• View payroll history\n\nGo to Payroll section to manage.`,
        suggestions: ['Process payroll', 'View all payrolls', 'Generate payslips'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/payroll' }
      };
    }

    if (message.includes('when') || message.includes('date') || message.includes('schedule')) {
      return {
        message: 'Payroll is typically processed monthly. You can set up automated payroll processing in the Automation section. The system can automatically process payroll on a schedule.',
        suggestions: ['Set up auto payroll', 'View automation', 'Check schedule']
      };
    }

    if (message.includes('deduction') || message.includes('tax') || message.includes('tds')) {
      return {
        message: 'Deductions include:\n• Income Tax (TDS)\n• Provident Fund (PF)\n• Professional Tax\n• Other deductions as per company policy\n\nDetailed breakdown is available in each payslip.',
        suggestions: ['View payslip', 'Contact HR for details']
      };
    }

    return {
      message: "I'm the Payroll Bot! I can help you with:\n\n• Salary information\n• Payslip generation\n• Payroll processing\n• Deduction details\n\nWhat would you like to know?",
      suggestions: ['View my salary', 'Process payroll', 'Generate payslip', 'View deductions']
    };
  }

  /**
   * Leave Bot - Leave policies and requests
   */
  private static async handleLeaveBot(
    userId: string,
    companyId: string | null,
    message: string
  ): Promise<ChatbotResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    const userRole = user?.role || 'EMPLOYEE';
    const isEmployee = userRole === 'EMPLOYEE';

    // Check leave balance and requests
    if (message.includes('leave') || message.includes('vacation') || message.includes('holiday')) {
      if (isEmployee && user?.employee) {
        const pendingLeaves = await prisma.leave.count({
          where: {
            employeeId: user.employee.id,
            status: 'PENDING'
          }
        });

        const approvedLeaves = await prisma.leave.count({
          where: {
            employeeId: user.employee.id,
            status: 'APPROVED'
          }
        });

        return {
          message: `Your Leave Status:\n\n• Pending Requests: ${pendingLeaves}\n• Approved Leaves: ${approvedLeaves}\n\nYou can apply for leave, check leave balance, and view leave history in the Leaves section.`,
          suggestions: ['Apply for leave', 'View leave balance', 'View leave history'],
          actionRequired: true,
          actionType: 'navigate',
          actionData: { path: '/hr/leaves' }
        };
      }

      // For HR/Admin
      const pendingLeaves = await prisma.leave.count({
        where: {
          status: 'PENDING',
          employee: {
            companyId: companyId || undefined
          }
        }
      });

      return {
        message: `Leave Management:\n\n• Pending Approvals: ${pendingLeaves}\n• You can approve/reject leave requests\n• View all employee leaves\n• Manage leave policies\n\nGo to Leaves section to manage.`,
        suggestions: ['View pending leaves', 'Approve leaves', 'View all leaves'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/leaves' }
      };
    }

    if (message.includes('apply') || message.includes('request') || message.includes('new')) {
      return {
        message: 'To apply for leave:\n\n1. Go to the Leaves section\n2. Click "Apply for Leave"\n3. Select leave type, dates, and reason\n4. Submit for approval\n\nYour manager/HR will review and approve.',
        suggestions: ['Apply now', 'View leave types', 'Check leave balance'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/leaves' }
      };
    }

    if (message.includes('balance') || message.includes('available') || message.includes('remaining')) {
      return {
        message: 'Leave balance information is available in the Leaves section. You can see:\n• Earned Leave balance\n• Sick Leave balance\n• Casual Leave balance\n• Other leave types as per company policy',
        suggestions: ['View leave balance', 'Check leave history'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/leaves' }
      };
    }

    if (message.includes('type') || message.includes('kind') || message.includes('category')) {
      return {
        message: 'Available Leave Types:\n\n• Sick Leave\n• Casual Leave\n• Earned Leave\n• Maternity Leave\n• Paternity Leave\n• Comp Off\n• Loss of Pay (LOP)\n\nSpecific types may vary by company policy.',
        suggestions: ['Apply for leave', 'View leave policy']
      };
    }

    return {
      message: "I'm the Leave Bot! I can help you with:\n\n• Applying for leave\n• Checking leave balance\n• Leave policies\n• Leave approvals\n\nWhat would you like to do?",
      suggestions: ['Apply for leave', 'Check balance', 'View pending leaves', 'View leave history']
    };
  }

  /**
   * Attendance Bot - Attendance tracking help
   */
  private static async handleAttendanceBot(
    userId: string,
    companyId: string | null,
    message: string
  ): Promise<ChatbotResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    const userRole = user?.role || 'EMPLOYEE';
    const isEmployee = userRole === 'EMPLOYEE';

    if (message.includes('clock') || message.includes('in') || message.includes('out') || message.includes('attendance')) {
      if (isEmployee && user?.employee) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayAttendance = await prisma.attendance.findFirst({
          where: {
            employeeId: user.employee.id,
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        });

        if (todayAttendance) {
          const clockIn = todayAttendance.clockIn ? new Date(todayAttendance.clockIn).toLocaleTimeString() : 'Not clocked in';
          const clockOut = todayAttendance.clockOut ? new Date(todayAttendance.clockOut).toLocaleTimeString() : 'Not clocked out';
          
          return {
            message: `Today's Attendance:\n\n• Clock In: ${clockIn}\n• Clock Out: ${clockOut}\n• Status: ${todayAttendance.status}\n• Hours: ${todayAttendance.totalHours || 0} hours\n\nYou can clock in/out and view attendance history in the Attendance section.`,
            suggestions: ['Clock in/out', 'View attendance history', 'View monthly report'],
            actionRequired: true,
            actionType: 'navigate',
            actionData: { path: '/hr/attendance' }
          };
        }

        return {
          message: "You haven't clocked in today. You can clock in from the Attendance section. Make sure to clock in when you start work and clock out when you finish.",
          suggestions: ['Clock in now', 'View attendance section'],
          actionRequired: true,
          actionType: 'navigate',
          actionData: { path: '/hr/attendance' }
        };
      }

      // For HR/Admin
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayAttendance = await prisma.attendance.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          },
          employee: {
            companyId: companyId || undefined
          }
        }
      });

      return {
        message: `Attendance Overview:\n\n• Today's Records: ${todayAttendance}\n• You can view all employee attendance\n• Track clock in/out times\n• Generate attendance reports\n\nGo to Attendance section to manage.`,
        suggestions: ['View today attendance', 'View all attendance', 'Generate report'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/attendance' }
      };
    }

    if (message.includes('report') || message.includes('history') || message.includes('record')) {
      return {
        message: 'You can view detailed attendance reports in the Attendance section:\n• Daily attendance\n• Monthly reports\n• Attendance history\n• Hours worked\n• Absence records',
        suggestions: ['View attendance', 'Generate report'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/attendance' }
      };
    }

    return {
      message: "I'm the Attendance Bot! I can help you with:\n\n• Clocking in/out\n• Viewing attendance records\n• Attendance reports\n• Tracking work hours\n\nWhat would you like to do?",
      suggestions: ['Clock in/out', 'View today attendance', 'View attendance history', 'Generate report']
    };
  }

  /**
   * General Support Bot - FAQs and general help
   */
  private static async handleGeneralSupport(
    userId: string,
    companyId: string | null,
    message: string
  ): Promise<ChatbotResponse> {
    if (message.includes('contact') || message.includes('support') || message.includes('help')) {
      return {
        message: 'For support, you can:\n\n• Create a support ticket in the Support section\n• Contact your HR department\n• Email: support@shahworks.com\n• Visit: www.shahworks.com\n\nGrandHR is made by Shah Works.',
        suggestions: ['Create support ticket', 'View support section', 'Contact HR'],
        actionRequired: true,
        actionType: 'navigate',
        actionData: { path: '/hr/support' }
      };
    }

    if (message.includes('feature') || message.includes('how to') || message.includes('tutorial')) {
      return {
        message: 'GrandHR offers:\n\n• Employee Management\n• Leave Management\n• Attendance Tracking\n• Payroll Processing\n• Document Generation\n• Organizational Hierarchy\n• Automation\n• Support System\n\nUse the specialized chatbots for specific help!',
        suggestions: ['HR Assistant', 'Payroll Bot', 'Leave Bot', 'Attendance Bot']
      };
    }

    if (message.includes('company') || message.includes('shah works') || message.includes('about')) {
      return {
        message: 'GrandHR is a comprehensive HR management solution made by Shah Works.\n\nVisit us at: www.shahworks.com\n\nWe provide complete HR solutions for companies and their employees.',
        suggestions: ['Visit website', 'Contact support', 'View features']
      };
    }

    return {
      message: "I'm here to help! I can assist with:\n\n• General questions about GrandHR\n• Feature information\n• Support and contact\n• Navigation help\n\nTry asking about specific features or use the specialized chatbots for detailed help!",
      suggestions: ['How to use GrandHR?', 'Contact support', 'View features', 'Get help']
    };
  }

  /**
   * Get available chatbots
   */
  static getAvailableChatbots(): Array<{ type: ChatbotType; name: string; description: string; icon: string }> {
    return [
      {
        type: ChatbotType.HR_ASSISTANT,
        name: 'HR Assistant',
        description: 'General HR questions and employee management',
        icon: '👔'
      },
      {
        type: ChatbotType.PAYROLL_BOT,
        name: 'Payroll Bot',
        description: 'Salary, payslips, and payroll queries',
        icon: '💰'
      },
      {
        type: ChatbotType.LEAVE_BOT,
        name: 'Leave Bot',
        description: 'Leave policies, requests, and balance',
        icon: '📅'
      },
      {
        type: ChatbotType.ATTENDANCE_BOT,
        name: 'Attendance Bot',
        description: 'Clock in/out and attendance tracking',
        icon: '⏰'
      },
      {
        type: ChatbotType.GENERAL_SUPPORT,
        name: 'General Support',
        description: 'FAQs and general help',
        icon: '💬'
      }
    ];
  }
}

