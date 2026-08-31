import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..', '..');
const databaseDirectory = resolve(repositoryRoot, '.e2e-data');
const databasePath = resolve(databaseDirectory, 'book-quotes.db');
const apiProject = resolve(repositoryRoot, 'server', 'BookQuotes.Api');

mkdirSync(databaseDirectory, { recursive: true });
for (const suffix of ['', '-shm', '-wal']) {
  rmSync(`${databasePath}${suffix}`, { force: true });
}

const api = spawn('dotnet', ['run', '--project', apiProject, '--no-launch-profile'], {
  cwd: repositoryRoot,
  env: {
    ...process.env,
    ASPNETCORE_ENVIRONMENT: 'Development',
    ASPNETCORE_URLS: 'http://localhost:5047',
    ConnectionStrings__DefaultConnection: `Data Source=${databasePath}`,
    Cors__AllowedOrigins__0: 'http://localhost:4200',
    Jwt__Key: 'e2e-only-signing-key-with-at-least-32-characters',
  },
  stdio: 'inherit',
});

let stopping = false;
function stop(signal) {
  if (stopping) {
    return;
  }

  stopping = true;
  api.kill(signal);
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
api.on('exit', (code, signal) => {
  if (!stopping && code !== 0) {
    console.error(`API process exited unexpectedly (${signal ?? code}).`);
  }
  process.exit(code ?? (stopping ? 0 : 1));
});
