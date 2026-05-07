import { api, unwrap, TOKEN_KEY } from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const reportsApi = {
  headcount: () => api.get('/reports/headcount').then(unwrap),
  attendance: ({ month, year }) =>
    api.get('/reports/attendance', { params: { month, year } }).then(unwrap),
  leaves: ({ from, to } = {}) =>
    api.get('/reports/leaves', { params: { from, to } }).then(unwrap),
  payroll: ({ month, year }) =>
    api.get('/reports/payroll', { params: { month, year } }).then(unwrap),
};

/**
 * Trigger a CSV download in the browser. We can't use the axios instance because
 * the response is a binary attachment; instead we open a fetch with the auth header
 * and stream the blob into a temporary anchor.
 */
export async function downloadReportCsv(path, params = {}) {
  const url = new URL(API_URL + path);
  const search = { ...params, format: 'csv' };
  Object.entries(search).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const match = /filename="?([^";]+)"?/.exec(cd);
  const filename = match?.[1] || 'report.csv';
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
  return filename;
}
