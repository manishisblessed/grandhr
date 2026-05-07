import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Eye, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { documentsApi } from '../../api/documents';
import { formatDate } from '../../lib/utils';

export default function EmployeeDocuments() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentsApi.myDocuments,
  });
  const docs = data?.documents || [];
  const filtered = docs.filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase())
  );

  const downloadHtml = (doc) => {
    const blob = new Blob([wrapHtml(doc.content, doc.title)], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${doc.title}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">My documents</h1>
        <p className="text-muted-foreground mt-1">
          Letters, slips and certificates issued by HR.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search documents…"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="size-14 rounded-2xl mx-auto bg-primary/10 grid place-items-center mb-3">
              <FileText className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold">No documents yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When HR sends you a letter or document, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="relative"
            >
              <Card className="hover:border-primary/50 transition-colors h-full">
                <div className="relative h-28 bg-gradient-to-br from-primary/15 via-accent/10 to-card overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <FileText className="absolute right-4 bottom-4 size-12 text-primary/50" />
                  <Badge variant="secondary" className="absolute top-3 left-3">
                    {d.documentType.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setActive(d)}>
                      <Eye className="size-3.5" />
                      View
                    </Button>
                    <Button variant="gradient" size="sm" className="flex-1" onClick={() => downloadHtml(d)}>
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-w-none mt-4" dangerouslySetInnerHTML={{ __html: active.content }} />
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                <Button variant="gradient" onClick={() => downloadHtml(active)}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function wrapHtml(inner, title) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${title}</title>
  <style>body{font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f2937;background:#f8fafc;padding:24px;}
  .container{max-width:760px;margin:0 auto;background:white;padding:48px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,0.06);}</style></head>
  <body><div class="container">${inner}</div></body></html>`;
}
