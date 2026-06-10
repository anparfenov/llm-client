import { existsSync, watch } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const serverDir = join(rootDir, 'server');
const viteBin = join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
const serverEntry = join(serverDir, 'index.ts');
const serverPort = process.env.PORT || '3000';

let serverProcess;
let restartTimer;
let isShuttingDown = false;

if (!existsSync(viteBin)) {
  console.error('Vite binary was not found. Run npm install first.');
  process.exit(1);
}

const clientProcess = spawn(viteBin, ['--host', '0.0.0.0'], {
  cwd: rootDir,
  env: {
    ...process.env,
    CHAT_PROXY_TARGET: `http://localhost:${serverPort}`,
  },
  stdio: 'inherit',
});

startServer();

const serverWatcher = watch(serverDir, { recursive: true }, () => {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(restartServer, 150);
});

clientProcess.on('exit', (code, signal) => {
  if (isShuttingDown) {
    return;
  }

  console.error(`Vite exited${formatExit(code, signal)}.`);
  shutdown(code ?? 1);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function startServer() {
  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: serverPort,
    },
    stdio: 'inherit',
  });

  serverProcess.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    if (signal === 'SIGTERM') {
      return;
    }

    console.error(`Server exited${formatExit(code, signal)}.`);
  });
}

function restartServer() {
  if (!serverProcess || serverProcess.killed) {
    startServer();
    return;
  }

  const currentServer = serverProcess;

  currentServer.once('exit', () => {
    if (!isShuttingDown) {
      startServer();
    }
  });
  currentServer.kill('SIGTERM');
}

function shutdown(exitCode) {
  isShuttingDown = true;
  clearTimeout(restartTimer);
  serverWatcher.close();
  clientProcess.kill('SIGTERM');
  serverProcess?.kill('SIGTERM');
  process.exit(exitCode);
}

function formatExit(code, signal) {
  if (signal) {
    return ` from ${signal}`;
  }

  return typeof code === 'number' ? ` with code ${code}` : '';
}
