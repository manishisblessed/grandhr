import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Sparkles, Building2, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';

export default function EmployeeIdCard() {
  const { user } = useAuth();
  const cardRef = useRef(null);

  const employee = user?.employee || {};
  const fullName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || user?.email;
  const empId = employee.employeeId || '—';
  const department = employee.department?.name || '—';
  const designation = employee.designation?.name || '—';
  const company = 'GrandHR';
  const initials = getInitials(fullName);

  const qrPayload = JSON.stringify({
    id: empId,
    name: fullName,
    company,
    issued: new Date().toISOString(),
  });

  const downloadPdf = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [86, 135] });
    pdf.addImage(imgData, 'PNG', 0, 0, 86, 135);
    pdf.save(`${empId}-id-card.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My ID Card</h1>
          <p className="text-muted-foreground mt-1">Download as PDF anytime.</p>
        </div>
        <Button variant="gradient" onClick={downloadPdf}>
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      <div className="flex justify-center py-8">
        <motion.div
          initial={{ rotateY: 30, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformPerspective: 1200 }}
          whileHover={{ rotateY: -8, rotateX: 4 }}
          className="relative"
        >
          <div
            ref={cardRef}
            className="w-[320px] h-[500px] rounded-2xl shadow-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(160deg, #1a1830 0%, #0f0e1f 100%)',
            }}
          >
            {/* Top mesh */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(at 20% 0%, rgba(139,92,246,0.6) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(99,102,241,0.45) 0px, transparent 50%)',
              }}
            />
            <div className="absolute inset-x-0 top-0 h-32 flex items-center justify-between px-5">
              <div className="flex items-center gap-2 text-white">
                <div className="size-8 rounded-lg bg-white/15 backdrop-blur grid place-items-center">
                  <Sparkles className="size-4" />
                </div>
                <span className="font-display font-bold text-sm tracking-wide">{company}</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/70">Employee</span>
            </div>

            {/* Avatar */}
            <div className="relative z-10 flex flex-col items-center pt-24 px-6 text-white">
              <div className="size-28 rounded-full ring-4 ring-white/20 bg-gradient-to-br from-primary to-accent grid place-items-center text-2xl font-bold shadow-2xl">
                {initials || 'EE'}
              </div>
              <p className="font-display font-bold text-xl mt-4 text-center">{fullName}</p>
              <p className="text-white/80 text-sm">{designation}</p>
              <p className="text-white/60 text-xs mt-1">{department}</p>
            </div>

            {/* Info */}
            <div className="relative z-10 mt-6 mx-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4 text-white space-y-2">
              <Row label="ID" value={empId} />
              <Row label="Email" value={user?.email || '—'} />
            </div>

            {/* QR */}
            <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-2 z-10">
              <div className="size-20 bg-white p-1.5 rounded-lg">
                <QRCodeCanvas value={qrPayload} size={68} bgColor="#ffffff" fgColor="#1a1830" includeMargin={false} />
              </div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Scan to verify</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-widest text-white/60">{label}</span>
      <span className="text-xs font-medium truncate">{value}</span>
    </div>
  );
}
