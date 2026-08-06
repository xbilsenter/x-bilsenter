import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function cssBeforeJs() {
  return {
    name: 'css-before-js',
    transformIndexHtml(html, ctx) {
      let out = html;
      const cssLink = out.match(/<link rel="stylesheet"[^>]*>/);
      const moduleScript = out.match(/<script type="module"[^>]*><\/script>/);

      if (cssLink && moduleScript) {
        out = out.replace(cssLink[0], '');
        out = out.replace(moduleScript[0], `${cssLink[0]}\n    ${moduleScript[0]}`);
      }

      if (ctx.bundle) {
        const entry = Object.values(ctx.bundle).find(
          (chunk) => chunk.type === 'chunk' && chunk.isEntry
        );
        if (entry) {
          const preload = `<link rel="modulepreload" crossorigin href="/${entry.fileName}">`;
          if (!out.includes(preload)) {
            out = out.replace('</head>', `    ${preload}\n  </head>`);
          }
        }
      }

      return out;
    },
  };
}

export default defineConfig({
  plugins: [react(), cssBeforeJs()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
