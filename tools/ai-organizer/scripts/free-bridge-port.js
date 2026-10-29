/**
 * 啟動 bridge 前釋放埠號（結束舊的 LISTENING process）。
 * 供 `npm run bridge` 自動重啟使用。
 */
const { execSync } = require('child_process');

const port = Number(process.env.FTC_BRIDGE_PORT ?? 3847);
if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error(`[bridge] 無效的 FTC_BRIDGE_PORT: ${process.env.FTC_BRIDGE_PORT}`);
  process.exit(1);
}

function freePortOnWindows(targetPort) {
  let output = '';
  try {
    output = execSync(`netstat -ano | findstr :${targetPort}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!line.includes('LISTENING')) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid) && pid !== '0') {
      pids.add(pid);
    }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[bridge] 已結束佔用埠 ${targetPort} 的 process（PID ${pid}）`);
    } catch {
      console.warn(`[bridge] 無法結束 PID ${pid}（可能已結束）`);
    }
  }
}

function freePortOnUnix(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (!output) return;
    for (const pid of output.split(/\s+/)) {
      if (!pid) continue;
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`[bridge] 已結束佔用埠 ${targetPort} 的 process（PID ${pid}）`);
      } catch {
        console.warn(`[bridge] 無法結束 PID ${pid}`);
      }
    }
  } catch {
    // 埠未被占用
  }
}

if (process.platform === 'win32') {
  freePortOnWindows(port);
} else {
  freePortOnUnix(port);
}
