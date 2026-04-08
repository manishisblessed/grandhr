/**
 * Shared HTML letterhead: company logo (optional) + name + full address block.
 * Use inside document preview templates (screen HTML can show ₹; PDFs use ASCII amounts separately).
 */
export function companyLetterheadHtml(company) {
  const c = company || {};
  const logoBlock = c.logoImage
    ? `<div class="flex-shrink-0"><img src="${c.logoImage}" alt="Company logo" class="max-h-20 max-w-[160px] object-contain object-left-top" /></div>`
    : '';
  const addr = c.address ? String(c.address).replace(/\n/g, '<br>') : '';
  const websiteLine = c.website ? `<div class="text-gray-600">Website: ${c.website}</div>` : '';
  return `
    <div class="flex flex-wrap items-start gap-4 border-b-2 border-gray-200 pb-4 mb-4">
      <div class="flex items-start gap-4 min-w-0 flex-1">
        ${logoBlock}
        <div class="text-sm leading-relaxed min-w-0">
          <div class="font-bold text-lg text-gray-900">${c.name || 'Company Name'}</div>
          ${addr ? `<div class="text-gray-700 mt-1">${addr}</div>` : ''}
          ${c.email ? `<div class="text-gray-600">Email: ${c.email}</div>` : ''}
          ${c.phone ? `<div class="text-gray-600">Phone: ${c.phone}</div>` : ''}
          ${websiteLine}
        </div>
      </div>
    </div>
  `;
}
