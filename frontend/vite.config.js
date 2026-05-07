import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vendor chunk groups — every entry is a hot library family that we want
 * loaded as its own chunk so the landing page only pulls what it needs and
 * subsequent navigations re-use cached vendor bundles.
 */
/**
 * Each entry contains either an exact package name or a prefix match (ending in `*`).
 * Order is preserved — first match wins.
 */
const vendorGroups = {
  'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler', 'react-reconciler'],
  'motion-vendor': ['framer-motion', 'motion-dom', 'motion-utils'],
  'three-vendor': [
    'three', 'three-stdlib', 'three-mesh-bvh', 'meshline', 'maath', 'troika-*', 'webgl-sdf-generator',
    '@react-three/*', '@react-spring/*', 'detect-gpu', 'detect-node-es', 'camera-controls', 'stats-gl',
    'stats.js', 'hls.js', '@mediapipe/*', 'suspend-react', 'tunnel-rat', 'zustand', '@use-gesture/*',
    'bidi-js', 'potpack', 'tiny-invariant', 'react-composer',
  ],
  'radix-vendor': [
    '@radix-ui/*', '@floating-ui/*', 'aria-hidden', 'react-remove-scroll', 'react-remove-scroll-bar',
    'react-style-singleton', 'use-callback-ref', 'use-sidecar', 'get-nonce',
  ],
  'icons-vendor': ['lucide-react'],
  'query-vendor': ['@tanstack/*'],
  'charts-vendor': ['recharts', 'd3-*', 'victory-vendor', 'internmap', 'fast-equals', 'react-smooth'],
  'editor-vendor': [
    '@tiptap/*', 'prosemirror-*', 'orderedmap', 'rope-sequence', 'w3c-keyname', 'linkifyjs',
  ],
  'pdf-vendor': [
    'html2canvas', 'jspdf', 'jspdf-autotable', '@react-pdf/*', 'pdfkit', 'fontkit', 'restructure',
    'tiny-inflate', 'unicode-*', 'png-js', 'canvg', 'rgbcolor', 'stackblur-canvas', 'raf',
    'performance-now', '@babel/runtime',
  ],
  'docx-vendor': ['mammoth', 'jszip', 'pako'],
  'form-vendor': ['react-hook-form', '@hookform/*'],
  'zod-vendor': ['zod'],
  'qrcode-vendor': ['qrcode.react', 'qrcode'],
  'sonner-vendor': ['sonner', 'react-hot-toast', 'goober'],
  'sentry-vendor': ['@sentry/*', '@sentry-internal/*'],
  'http-vendor': ['axios', 'follow-redirects', 'form-data'],
  'misc-vendor': [
    'date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority', 'dompurify', 'tslib',
    'prop-types', 'core-js', 'react-dropzone', 'attr-accept', 'file-selector',
  ],
};

const matchPattern = (pkgPath, pattern) => {
  // pkgPath looks like "react-dom" or "@radix-ui/react-dialog"
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return pkgPath === prefix || pkgPath.startsWith(prefix + '/');
  }
  if (pattern.endsWith('*')) {
    return pkgPath.startsWith(pattern.slice(0, -1));
  }
  return pkgPath === pattern;
};

const resolveVendorChunk = (id) => {
  if (!id.includes('node_modules')) return undefined;
  // Normalise Windows backslashes and pick out the topmost package name.
  const norm = id.replace(/\\/g, '/');
  const match = norm.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
  if (!match) return undefined;
  const pkgPath = match[1];

  for (const [chunk, patterns] of Object.entries(vendorGroups)) {
    for (const pattern of patterns) {
      if (matchPattern(pkgPath, pattern)) {
        return chunk;
      }
    }
  }
  // Fallback: split anything else into a per-package chunk so we never
  // accidentally ship a giant catch-all bundle on the landing page.
  const safe = pkgPath.replace('@', '').replace(/\//g, '__');
  return `pkg-${safe}`;
};

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => resolveVendorChunk(id),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    middlewareMode: false,
  },
  publicDir: 'public',
  appType: 'spa',
});
