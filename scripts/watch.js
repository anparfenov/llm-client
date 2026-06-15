import { existsSync, watch } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const serverDir = join(rootDir, 'server');
const viteBin = join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
const serverEntry = join(serverDir, 'index.ts');
const serverPort = process.env.PORT || String(await findAvailablePort(3000));
const clientPort = process.env.CLIENT_PORT || String(await findAvailablePort(5173));
const clientDevServerUrl = `http://localhost:${clientPort}`;

let serverProcess;
let restartTimer;
let isShuttingDown = false;

if (!existsSync(viteBin)) {
  console.error('Vite binary was not found. Run npm install first.');
  process.exit(1);
}

const clientProcess = spawn(viteBin, ['--host', '0.0.0.0', '--port', clientPort, '--strictPort'], {
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
      CLIENT_DEV_SERVER_URL: clientDevServerUrl,
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

async function findAvailablePort(startPort) {
  let port = startPort;

  while (!(await isPortAvailable(port))) {
    port += 1;
  }

  return port;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const probe = createServer();

    probe.once('error', () => resolve(false));
    probe.once('listening', () => {
      probe.close(() => resolve(true));
    });
    probe.listen(port, '0.0.0.0');
  });
}
