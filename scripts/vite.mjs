import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { build, createServer, preview } from 'vite';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.join(project, 'src');
const publicDir = path.join(project, 'public');
const outDir = path.join(project, 'dist');
const common = {
  configFile: false,
  root,
  base: './',
  publicDir,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: { input: { index: path.join(root, 'index.html'), cms: path.join(root, 'cms.html'), consultations: path.join(root, 'consultations.html') } },
  },
};
const mode = process.argv[2];
const publishableFiles = [
  '.gitignore', 'README.md', 'package.json', 'package-lock.json',
  '.github/workflows/pages.yml', 'public/cv-data.json', 'public/favicon.svg',
  'src/index.html', 'src/cms.html', 'src/resume.js',
  'src/pages/editor/app.js', 'src/pages/editor/data.js',
];

if (mode === 'build') await build(common);
else if (mode === 'dev') {
  const server = await createServer({ ...common, plugins: [{ name: 'local-github-bootstrap-files', configureServer(server) {
    server.middlewares.use('/__source', async (request, response, next) => {
      const relative = decodeURIComponent((request.url || '').split('?')[0]).replace(/^\//, '');
      if (!publishableFiles.includes(relative)) return next();
      try { const content = await readFile(path.join(project, relative)); response.statusCode = 200; response.setHeader('Content-Type', 'application/octet-stream'); response.end(content); }
      catch { response.statusCode = 404; response.end('Not found'); }
    });
  } }], server: { host: '127.0.0.1', port: 3000, strictPort: true } });
  await server.listen();
  server.printUrls();
}
else if (mode === 'preview') {
  const server = await preview({ ...common, preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
  server.printUrls();
}
else throw new Error('Usage: node scripts/vite.mjs <dev|build|preview>');
