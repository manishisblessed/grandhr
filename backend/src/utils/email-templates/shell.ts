/**
 * Branded email shell + helpers used by every transactional email
 * GrandHR sends. Keeps a consistent visual identity (logo, colors, footer).
 *
 * Mail clients are notoriously inconsistent, so this template uses
 * inline-friendly CSS, table-free layout (with safe fallbacks), and avoids
 * background images or CSS variables. It renders well in Gmail, Outlook,
 * Apple Mail, and most webmail clients.
 */

export type AccentTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const ACCENTS: Record<AccentTone, { from: string; to: string }> = {
  primary: { from: '#6366f1', to: '#8b5cf6' },
  success: { from: '#10b981', to: '#059669' },
  warning: { from: '#f59e0b', to: '#d97706' },
  danger: { from: '#ef4444', to: '#dc2626' },
  neutral: { from: '#1e293b', to: '#334155' },
};

export type EmailButton = {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary';
};

export type EmailKeyValue = {
  label: string;
  value: string;
};

export type EmailSection =
  | { type: 'paragraph'; html: string }
  | { type: 'heading'; text: string }
  | { type: 'kv'; items: EmailKeyValue[] }
  | { type: 'callout'; tone?: AccentTone; html: string }
  | { type: 'note'; html: string }
  | { type: 'spacer' };

export type EmailShellOptions = {
  preheader?: string;
  badge?: string;
  title: string;
  greeting?: string;
  intro?: string;
  sections?: EmailSection[];
  buttons?: EmailButton[];
  accent?: AccentTone;
  signOff?: string;
  showFooter?: boolean;
};

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderButtons = (buttons: EmailButton[] | undefined, accent: AccentTone) => {
  if (!buttons || buttons.length === 0) return '';
  const colors = ACCENTS[accent];
  const html = buttons
    .map((b) => {
      const isPrimary = b.variant !== 'secondary';
      const style = isPrimary
        ? `background:linear-gradient(135deg, ${colors.from}, ${colors.to});color:#ffffff;`
        : `background:#ffffff;color:#334155;border:1px solid #cbd5e1;`;
      return `<a href="${escapeHtml(b.url)}" style="${style}display:inline-block;padding:13px 28px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;margin:6px 6px 0;">${escapeHtml(b.label)}</a>`;
    })
    .join('');
  return `<div style="text-align:center;margin:28px 0 8px;">${html}</div>`;
};

const renderSections = (sections: EmailSection[] | undefined) => {
  if (!sections || sections.length === 0) return '';
  return sections
    .map((s) => {
      switch (s.type) {
        case 'paragraph':
          return `<p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 14px;">${s.html}</p>`;
        case 'heading':
          return `<h3 style="color:#0f172a;font-size:17px;font-weight:700;margin:24px 0 12px;">${escapeHtml(s.text)}</h3>`;
        case 'kv': {
          const rows = s.items
            .map(
              (item) =>
                `<tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;font-weight:500;">${escapeHtml(item.label)}</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(item.value)}</td></tr>`,
            )
            .join('');
          return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border-radius:12px;padding:8px 18px;margin:18px 0;"><tbody>${rows}</tbody></table>`;
        }
        case 'callout': {
          const tone = s.tone || 'primary';
          const colors = ACCENTS[tone];
          return `<div style="background:${colors.from}10;border-left:4px solid ${colors.from};padding:14px 18px;border-radius:0 10px 10px 0;margin:20px 0;color:#1e293b;font-size:14px;line-height:1.55;">${s.html}</div>`;
        }
        case 'note':
          return `<p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:20px 0;font-size:13px;color:#92400e;line-height:1.55;">${s.html}</p>`;
        case 'spacer':
          return `<div style="height:18px;line-height:18px;">&nbsp;</div>`;
        default:
          return '';
      }
    })
    .join('');
};

const renderTextFallback = (opts: EmailShellOptions): string => {
  const lines: string[] = [];
  lines.push('GRANDHR');
  lines.push('========');
  if (opts.title) lines.push(opts.title);
  if (opts.greeting) lines.push('', opts.greeting);
  if (opts.intro) lines.push('', opts.intro);
  if (opts.sections) {
    for (const s of opts.sections) {
      switch (s.type) {
        case 'heading':
          lines.push('', s.text.toUpperCase());
          break;
        case 'paragraph':
          lines.push('', s.html.replace(/<[^>]*>/g, ''));
          break;
        case 'kv':
          for (const item of s.items) lines.push(`  ${item.label}: ${item.value}`);
          break;
        case 'callout':
        case 'note':
          lines.push('', `> ${s.html.replace(/<[^>]*>/g, '')}`);
          break;
        case 'spacer':
          lines.push('');
          break;
      }
    }
  }
  if (opts.buttons) {
    lines.push('');
    for (const b of opts.buttons) lines.push(`${b.label}: ${b.url}`);
  }
  if (opts.signOff) lines.push('', opts.signOff);
  lines.push('');
  lines.push('—');
  lines.push(`© ${new Date().getFullYear()} GrandHR · noreply@grandhr.in`);
  lines.push('Made by Shah Works · www.shahworks.com');
  return lines.join('\n');
};

/**
 * Render the branded email shell. Returns both HTML and a plain-text fallback.
 */
export function renderEmailShell(opts: EmailShellOptions): { html: string; text: string } {
  const accent = opts.accent || 'primary';
  const colors = ACCENTS[accent];
  const preheader = opts.preheader || opts.intro || opts.title;
  const frontendUrl = (process.env.FRONTEND_URL || 'https://grandhr.in').replace(/\/$/, '');
  const logoUrl = `${frontendUrl}/logo.jpeg`;
  const signOff = opts.signOff || 'The GrandHR team';
  const showFooter = opts.showFooter !== false;
  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${escapeHtml(opts.title)}</title>
<style>
  @media (max-width: 620px) {
    .gh-wrapper { padding: 16px 8px !important; }
    .gh-body { padding: 28px 22px !important; }
    .gh-header { padding: 28px 22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#1e293b;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f1f5f9;">${escapeHtml(preheader)}</div>
<div class="gh-wrapper" style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <div style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.08);">
    <div class="gh-header" style="background:linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%);padding:36px 32px 28px;text-align:center;">
      <img src="${logoUrl}" alt="GrandHR" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:14px;border:0;outline:none;text-decoration:none;background:#ffffff;padding:6px;">
      <p style="color:#ffffff;font-size:13px;letter-spacing:1.5px;font-weight:700;margin:0;text-transform:uppercase;opacity:0.9;">GrandHR</p>
      ${
        opts.badge
          ? `<div style="display:inline-block;margin-top:14px;background:rgba(255,255,255,0.18);color:#ffffff;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.4px;">${escapeHtml(opts.badge)}</div>`
          : ''
      }
      <h1 style="color:#ffffff;margin:14px 0 0;font-size:24px;font-weight:700;line-height:1.3;">${escapeHtml(opts.title)}</h1>
    </div>
    <div class="gh-body" style="padding:36px 32px;">
      ${
        opts.greeting
          ? `<p style="color:#0f172a;font-size:18px;font-weight:600;margin:0 0 14px;">${escapeHtml(opts.greeting)}</p>`
          : ''
      }
      ${
        opts.intro
          ? `<p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 14px;">${opts.intro}</p>`
          : ''
      }
      ${renderSections(opts.sections)}
      ${renderButtons(opts.buttons, accent)}
      <p style="color:#64748b;font-size:14px;line-height:1.65;margin:28px 0 0;">— ${escapeHtml(signOff)}</p>
    </div>
    ${
      showFooter
        ? `<div style="border-top:1px solid #e2e8f0;padding:22px 32px;text-align:center;background:#fafbfc;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;line-height:1.55;">© ${year} GrandHR · All rights reserved.</p>
        <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;line-height:1.55;">E-Block, Shiv Ram Park, Nangloi, New Delhi-110041</p>
        <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.55;">Made with care by <a href="https://www.shahworks.com/" style="color:${colors.from};text-decoration:none;">Shah Works</a> · This is an automated message; please do not reply.</p>
      </div>`
        : ''
    }
  </div>
</div>
</body>
</html>`;

  return { html, text: renderTextFallback(opts) };
}

export const emailEscape = escapeHtml;
