import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// ---------------------- helpers ----------------------

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const monthLabel = (year: number, month: number) =>
  `${MONTHS[Math.max(0, Math.min(11, month - 1))]} ${year}`;

const startOfMonth = (year: number, month1Indexed: number) =>
  new Date(year, month1Indexed - 1, 1, 0, 0, 0, 0);

const endOfMonth = (year: number, month1Indexed: number) =>
  new Date(year, month1Indexed, 0, 23, 59, 59, 999);

const monthsBack = (n: number, ref = new Date()): Array<{ year: number; month: number }> => {
  const out: Array<{ year: number; month: number }> = [];
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;
  for (let i = n - 1; i >= 0; i--) {
    let mm = m - i;
    let yy = y;
    while (mm <= 0) {
      mm += 12;
      yy -= 1;
    }
    out.push({ year: yy, month: mm });
  }
  return out;
};

const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const sendCsv = (res: Response, filename: string, headers: string[], rows: Array<Array<unknown>>) => {
  const csv = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv); // BOM so Excel opens UTF-8 correctly
};

const safeDiv = (num: number, denom: number) => (denom <= 0 ? 0 : num / denom);

const round = (n: number, digits = 1) => {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
};

const parseRangeParams = (req: AuthRequest, defaultMonths = 12) => {
  const today = new Date();
  const to = req.query.to ? new Date(String(req.query.to)) : today;
  const from = req.query.from
    ? new Date(String(req.query.from))
    : new Date(to.getFullYear(), to.getMonth() - (defaultMonths - 1), 1);
  return { from, to };
};

const wantsCsv = (req: AuthRequest) =>
  String(req.query.format || '').toLowerCase() === 'csv';

const getDeptMap = async (deptIds: Array<string | null | undefined>): Promise<Record<string, string>> => {
  const ids = Array.from(new Set(deptIds.filter((x): x is string => Boolean(x))));
  if (ids.length === 0) return {};
  const rows = await prisma.department.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  return Object.fromEntries(rows.map((r) => [r.id, r.name]));
};

// ---------------------- HEADCOUNT ----------------------

/**
 * GET /api/reports/headcount
 * Returns: totals, employment status breakdown, department breakdown, and a
 * 12-month headcount trend (computed from joiningDate / exitDate).
 */
export const getHeadcountReport = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const months = monthsBack(12, today);
    const earliestStart = startOfMonth(months[0].year, months[0].month);
    const latestEnd = endOfMonth(today.getFullYear(), today.getMonth() + 1);

    const [allEmployees, departmentRows, statusRows] = await Promise.all([
      prisma.employee.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          joiningDate: true,
          exitDate: true,
          isActive: true,
          employmentStatus: true,
          departmentId: true,
        },
      }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        where: { isActive: true },
        _count: { _all: true },
      }),
      prisma.employee.groupBy({
        by: ['employmentStatus'],
        where: { isActive: true },
        _count: { _all: true },
      }),
    ]);

    const deptMap = await getDeptMap(departmentRows.map((d) => d.departmentId));

    const trend = months.map(({ year, month }) => {
      const eom = endOfMonth(year, month);
      let active = 0;
      let joined = 0;
      let exited = 0;
      for (const e of allEmployees) {
        const joinedAt = new Date(e.joiningDate);
        const exitAt = e.exitDate ? new Date(e.exitDate) : null;
        if (joinedAt <= eom && (!exitAt || exitAt > eom)) active += 1;
        if (joinedAt.getFullYear() === year && joinedAt.getMonth() + 1 === month) joined += 1;
        if (exitAt && exitAt.getFullYear() === year && exitAt.getMonth() + 1 === month) exited += 1;
      }
      return { label: monthLabel(year, month), year, month, active, joined, exited };
    });

    const departmentBreakdown = departmentRows
      .map((d) => ({
        departmentId: d.departmentId,
        name: d.departmentId ? deptMap[d.departmentId] || 'Unknown' : 'Unassigned',
        count: d._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const statusBreakdown = statusRows
      .map((s) => ({ status: s.employmentStatus, count: s._count._all }))
      .sort((a, b) => b.count - a.count);

    const totals = {
      total: allEmployees.length,
      active: allEmployees.filter((e) => e.isActive).length,
      onLeave: allEmployees.filter((e) => e.employmentStatus === 'ON_LEAVE').length,
      probation: allEmployees.filter((e) => e.employmentStatus === 'PROBATION').length,
      thisMonthJoiners: trend[trend.length - 1]?.joined || 0,
      thisMonthExits: trend[trend.length - 1]?.exited || 0,
    };

    if (wantsCsv(req)) {
      const headers = ['Month', 'Active headcount', 'Joiners', 'Exits'];
      const rows = trend.map((t) => [t.label, t.active, t.joined, t.exited]);
      return sendCsv(res, `headcount-${today.toISOString().slice(0, 10)}.csv`, headers, rows);
    }

    res.json({ totals, trend, departmentBreakdown, statusBreakdown });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to build headcount report' });
  }
};

// ---------------------- ATTENDANCE ----------------------

/**
 * GET /api/reports/attendance?month=&year=
 * Per-employee attendance summary for the given month plus a daily presence
 * trend across the month.
 */
export const getAttendanceReport = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const month = parseInt(String(req.query.month ?? today.getMonth() + 1));
    const year = parseInt(String(req.query.year ?? today.getFullYear()));
    if (!month || !year) {
      return res.status(400).json({ message: 'month and year are required' });
    }
    const from = startOfMonth(year, month);
    const to = endOfMonth(year, month);

    const [employees, attendances] = await Promise.all([
      prisma.employee.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          departmentId: true,
        },
      }),
      prisma.attendance.findMany({
        where: { date: { gte: from, lte: to } },
        select: {
          employeeId: true,
          date: true,
          status: true,
          isLate: true,
          totalHours: true,
        },
      }),
    ]);

    const deptMap = await getDeptMap(employees.map((e) => e.departmentId));

    type Row = {
      employeeId: string;
      name: string;
      department: string;
      present: number;
      absent: number;
      onLeave: number;
      halfDay: number;
      late: number;
      hours: number;
      attendancePct: number;
    };

    const byEmp: Record<string, Row> = {};
    for (const e of employees) {
      byEmp[e.id] = {
        employeeId: e.employeeId,
        name: `${e.firstName} ${e.lastName}`.trim(),
        department: e.departmentId ? deptMap[e.departmentId] || '—' : '—',
        present: 0,
        absent: 0,
        onLeave: 0,
        halfDay: 0,
        late: 0,
        hours: 0,
        attendancePct: 0,
      };
    }
    for (const a of attendances) {
      const row = byEmp[a.employeeId];
      if (!row) continue;
      if (a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EARLY_DEPARTURE' || a.status === 'REGULARIZED') {
        row.present += 1;
      } else if (a.status === 'ABSENT') row.absent += 1;
      else if (a.status === 'ON_LEAVE') row.onLeave += 1;
      else if (a.status === 'HALF_DAY') row.halfDay += 0.5;
      if (a.isLate) row.late += 1;
      row.hours += a.totalHours || 0;
    }

    // Working days in the month (Mon–Fri excluding weekends, holidays not counted here for simplicity)
    let workingDays = 0;
    const cursor = new Date(from);
    while (cursor <= to) {
      const dow = cursor.getDay();
      if (dow !== 0 && dow !== 6) workingDays += 1;
      cursor.setDate(cursor.getDate() + 1);
    }

    const rows = Object.values(byEmp)
      .map((r) => ({
        ...r,
        attendancePct: round(safeDiv(r.present + r.halfDay, workingDays) * 100),
        hours: round(r.hours, 1),
      }))
      .sort((a, b) => b.attendancePct - a.attendancePct);

    // Daily trend
    const dailyMap: Record<string, { date: string; present: number; absent: number; onLeave: number }> = {};
    const dCursor = new Date(from);
    while (dCursor <= to) {
      const key = dCursor.toISOString().slice(0, 10);
      dailyMap[key] = { date: key, present: 0, absent: 0, onLeave: 0 };
      dCursor.setDate(dCursor.getDate() + 1);
    }
    for (const a of attendances) {
      const key = new Date(a.date).toISOString().slice(0, 10);
      const day = dailyMap[key];
      if (!day) continue;
      if (a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EARLY_DEPARTURE' || a.status === 'REGULARIZED') {
        day.present += 1;
      } else if (a.status === 'ABSENT') day.absent += 1;
      else if (a.status === 'ON_LEAVE') day.onLeave += 1;
    }
    const daily = Object.values(dailyMap);

    const totals = {
      employees: employees.length,
      workingDays,
      avgAttendancePct: round(safeDiv(rows.reduce((s, r) => s + r.attendancePct, 0), rows.length), 1),
      totalLateInstances: rows.reduce((s, r) => s + r.late, 0),
      totalHours: round(rows.reduce((s, r) => s + r.hours, 0), 1),
    };

    if (wantsCsv(req)) {
      const headers = [
        'Employee ID', 'Name', 'Department', 'Present', 'Half day', 'Absent',
        'On leave', 'Late instances', 'Total hours', 'Attendance %',
      ];
      const csvRows = rows.map((r) => [
        r.employeeId, r.name, r.department, r.present, r.halfDay, r.absent, r.onLeave, r.late, r.hours, r.attendancePct,
      ]);
      return sendCsv(res, `attendance-${monthLabel(year, month).replace(' ', '-')}.csv`, headers, csvRows);
    }

    res.json({ month, year, label: monthLabel(year, month), totals, rows, daily });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to build attendance report' });
  }
};

// ---------------------- LEAVES ----------------------

/**
 * GET /api/reports/leaves?from=&to=
 * Aggregated leave usage: by type, by status, top consumers.
 */
export const getLeaveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = parseRangeParams(req, 12);

    const [leaves, byType, byStatus] = await Promise.all([
      prisma.leave.findMany({
        where: { startDate: { gte: from, lte: to } },
        select: {
          employeeId: true,
          type: true,
          status: true,
          days: true,
          startDate: true,
          endDate: true,
          employee: { select: { firstName: true, lastName: true, employeeId: true, departmentId: true } },
        },
      }),
      prisma.leave.groupBy({
        by: ['type'],
        where: { startDate: { gte: from, lte: to } },
        _sum: { days: true },
        _count: { _all: true },
      }),
      prisma.leave.groupBy({
        by: ['status'],
        where: { startDate: { gte: from, lte: to } },
        _count: { _all: true },
      }),
    ]);

    const deptMap = await getDeptMap(leaves.map((l) => l.employee.departmentId));

    const byTypeOut = byType
      .map((t) => ({ type: t.type, days: round(t._sum.days || 0, 1), requests: t._count._all }))
      .sort((a, b) => b.days - a.days);

    const byStatusOut = byStatus
      .map((s) => ({ status: s.status, count: s._count._all }))
      .sort((a, b) => b.count - a.count);

    type Top = { employeeId: string; name: string; department: string; days: number; requests: number };
    const topMap: Record<string, Top> = {};
    for (const l of leaves) {
      if (l.status === 'CANCELLED' || l.status === 'REJECTED') continue;
      const key = l.employeeId;
      if (!topMap[key]) {
        topMap[key] = {
          employeeId: l.employee.employeeId,
          name: `${l.employee.firstName} ${l.employee.lastName}`.trim(),
          department: l.employee.departmentId ? deptMap[l.employee.departmentId] || '—' : '—',
          days: 0,
          requests: 0,
        };
      }
      topMap[key].days += l.days;
      topMap[key].requests += 1;
    }
    const topConsumers = Object.values(topMap)
      .map((c) => ({ ...c, days: round(c.days, 1) }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 10);

    // Monthly trend
    const months = monthsBack(12);
    const monthly = months.map(({ year, month }) => {
      const eom = endOfMonth(year, month);
      const som = startOfMonth(year, month);
      let days = 0;
      let requests = 0;
      for (const l of leaves) {
        if (l.status === 'CANCELLED' || l.status === 'REJECTED') continue;
        const sd = new Date(l.startDate);
        if (sd >= som && sd <= eom) {
          days += l.days;
          requests += 1;
        }
      }
      return { label: monthLabel(year, month), year, month, days: round(days, 1), requests };
    });

    const totals = {
      requests: leaves.length,
      approved: byStatus.find((s) => s.status === 'APPROVED')?._count._all || 0,
      pending: byStatus.find((s) => s.status === 'PENDING')?._count._all || 0,
      rejected: byStatus.find((s) => s.status === 'REJECTED')?._count._all || 0,
      totalDays: round(byTypeOut.reduce((s, t) => s + t.days, 0), 1),
    };

    if (wantsCsv(req)) {
      const headers = ['Employee ID', 'Name', 'Department', 'Total leave days', 'Requests'];
      const csvRows = topConsumers.map((c) => [c.employeeId, c.name, c.department, c.days, c.requests]);
      return sendCsv(res, `leaves-${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}.csv`, headers, csvRows);
    }

    res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      totals,
      byType: byTypeOut,
      byStatus: byStatusOut,
      topConsumers,
      monthly,
    });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to build leave report' });
  }
};

// ---------------------- PAYROLL ----------------------

/**
 * GET /api/reports/payroll?month=&year=
 * Cost breakdown for the given month: gross, deductions, by department, status mix.
 */
export const getPayrollReport = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const month = parseInt(String(req.query.month ?? today.getMonth() + 1));
    const year = parseInt(String(req.query.year ?? today.getFullYear()));
    if (!month || !year) {
      return res.status(400).json({ message: 'month and year are required' });
    }

    const payrolls = await prisma.payroll.findMany({
      where: { month, year },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            departmentId: true,
          },
        },
      },
    });

    const deptMap = await getDeptMap(payrolls.map((p) => p.employee.departmentId));

    const totals = {
      employees: payrolls.length,
      gross: 0,
      base: 0,
      allowances: 0,
      deductions: 0,
      tax: 0,
      net: 0,
    };
    const statusBreakdown: Record<string, number> = {};
    type DeptRow = { name: string; employees: number; gross: number; net: number };
    const byDeptMap: Record<string, DeptRow> = {};

    for (const p of payrolls) {
      const gross = p.baseSalary + p.allowances;
      totals.gross += gross;
      totals.base += p.baseSalary;
      totals.allowances += p.allowances;
      totals.deductions += p.deductions;
      totals.tax += p.tax;
      totals.net += p.netSalary;
      statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1;

      const deptKey = p.employee.departmentId || '__unassigned__';
      const deptName = p.employee.departmentId ? deptMap[p.employee.departmentId] || 'Unknown' : 'Unassigned';
      if (!byDeptMap[deptKey]) byDeptMap[deptKey] = { name: deptName, employees: 0, gross: 0, net: 0 };
      byDeptMap[deptKey].employees += 1;
      byDeptMap[deptKey].gross += gross;
      byDeptMap[deptKey].net += p.netSalary;
    }

    const byDepartment = Object.values(byDeptMap)
      .map((d) => ({ ...d, gross: round(d.gross, 0), net: round(d.net, 0) }))
      .sort((a, b) => b.net - a.net);

    const statusOut = Object.entries(statusBreakdown)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    const rows = payrolls
      .map((p) => ({
        employeeId: p.employee.employeeId,
        name: `${p.employee.firstName} ${p.employee.lastName}`.trim(),
        department: p.employee.departmentId ? deptMap[p.employee.departmentId] || '—' : '—',
        baseSalary: p.baseSalary,
        allowances: p.allowances,
        deductions: p.deductions,
        tax: p.tax,
        netSalary: p.netSalary,
        status: p.status,
      }))
      .sort((a, b) => b.netSalary - a.netSalary);

    const avgNet = round(safeDiv(totals.net, payrolls.length), 0);

    if (wantsCsv(req)) {
      const headers = ['Employee ID', 'Name', 'Department', 'Base', 'Allowances', 'Deductions', 'Tax', 'Net', 'Status'];
      const csvRows = rows.map((r) => [
        r.employeeId, r.name, r.department, r.baseSalary, r.allowances, r.deductions, r.tax, r.netSalary, r.status,
      ]);
      return sendCsv(res, `payroll-${monthLabel(year, month).replace(' ', '-')}.csv`, headers, csvRows);
    }

    // 12-month payroll cost trend
    const months = monthsBack(12);
    const trendKeys = months.map((m) => `${m.year}-${m.month}`);
    const trendData = await prisma.payroll.groupBy({
      by: ['year', 'month'],
      where: {
        OR: months.map((m) => ({ year: m.year, month: m.month })),
      },
      _sum: { netSalary: true, baseSalary: true, allowances: true },
    });
    const trendMap: Record<string, number> = {};
    for (const t of trendData) {
      trendMap[`${t.year}-${t.month}`] = t._sum.netSalary || 0;
    }
    const trend = months.map((m, i) => ({
      label: monthLabel(m.year, m.month),
      year: m.year,
      month: m.month,
      net: round(trendMap[trendKeys[i]] || 0, 0),
    }));

    res.json({
      month,
      year,
      label: monthLabel(year, month),
      totals: {
        employees: totals.employees,
        gross: round(totals.gross, 0),
        base: round(totals.base, 0),
        allowances: round(totals.allowances, 0),
        deductions: round(totals.deductions, 0),
        tax: round(totals.tax, 0),
        net: round(totals.net, 0),
        avgNet,
      },
      byDepartment,
      statusBreakdown: statusOut,
      rows,
      trend,
    });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to build payroll report' });
  }
};
