import { spawn } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

if (isProduction) {
  console.log('[CareSync] Production environment detected on host. Launching unified server...');
  const child = spawn('node', ['server/server.js'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
} else {
  const child = spawn(
    'npx',
    ['concurrently', '-n', 'SERVER,CLIENT', '-c', 'blue,green', 'npm run dev --prefix server', 'npm run dev --prefix client'],
    { stdio: 'inherit', shell: true }
  );
  child.on('exit', (code) => process.exit(code || 0));
}
