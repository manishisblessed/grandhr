import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarCheck2,
  Plane,
  Wallet,
  IdCard,
  FileText,
  Bell,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { documentsApi } from '../../api/documents';
import { formatDate } from '../../lib/utils';

export default function EmployeeDashboardNew() {
  const { user } = useAuth();
  const firstName = user?.employee?.firstName || 'there';
  const empId = user?.employee?.employeeId || '—';

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentsApi.myDocuments,
  });
  const myDocs = docsData?.documents || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-accent/10 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge variant="gradient" className="mb-3">
              <Sparkles className="size-3" />
              Hi {firstName}!
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Welcome to your workplace
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Employee ID <span className="font-mono font-semibold text-foreground">{empId}</span>.
              Punch in for the day, view your documents, or apply for leave — anytime.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="gradient" size="lg" asChild>
              <Link to="/employee/attendance">
                <Clock className="size-4" />
                Punch in
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/employee/leaves">
                <Plane className="size-4" />
                Apply leave
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck2} label="This month" value="22 / 23" sub="days present" color="from-emerald-500 to-teal-500" progress={96} />
        <StatCard icon={Plane} label="Leave balance" value="12.5" sub="days remaining" color="from-amber-500 to-orange-500" progress={62} />
        <StatCard icon={Wallet} label="Last salary" value="₹—" sub="check slip below" color="from-pink-500 to-rose-500" progress={100} />
        <StatCard icon={Bell} label="Notifications" value="3" sub="unread" color="from-violet-500 to-indigo-500" progress={50} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickLink to="/employee/id-card" icon={IdCard} label="ID Card" />
        <QuickLink to="/employee/documents" icon={FileText} label="My documents" />
        <QuickLink to="/employee/salary" icon={Wallet} label="Salary slips" />
        <QuickLink to="/employee/attendance" icon={CalendarCheck2} label="Attendance" />
        <QuickLink to="/employee/leaves" icon={Plane} label="Leaves" />
        <QuickLink to="/employee/profile" icon={Sparkles} label="Profile" />
      </div>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your latest documents</CardTitle>
            <CardDescription>Letters, slips and certificates from HR</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/employee/documents">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {docsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : myDocs.length === 0 ? (
            <div className="text-center py-8">
              <div className="size-12 rounded-xl bg-primary/10 mx-auto grid place-items-center mb-2">
                <FileText className="size-5 text-primary" />
              </div>
              <p className="font-medium">No documents yet</p>
              <p className="text-sm text-muted-foreground">When HR sends you a document, it'll appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {myDocs.slice(0, 6).map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-3">
                  <div className="size-10 rounded-lg bg-primary/10 grid place-items-center text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.documentType.replace(/_/g, ' ')} · {formatDate(d.createdAt)}</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, progress }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
          <div className={`size-10 rounded-lg bg-gradient-to-br ${color} grid place-items-center text-white shadow-md`}>
            <Icon className="size-5" />
          </div>
        </div>
        <Progress value={progress} />
      </CardContent>
    </Card>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="relative">
      <Link
        to={to}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors"
      >
        <div className="size-10 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-primary">
          <Icon className="size-5" />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </Link>
    </motion.div>
  );
}
