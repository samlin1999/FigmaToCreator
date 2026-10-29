import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

/** 載入 .env（不覆寫已存在的 process.env） */
export function loadEnvFiles(startDir: string): string[] {
  const loaded: string[] = [];
  const candidates = [
    join(startDir, '.env'),
    join(startDir, '.env.local'),
    join(dirname(startDir), '.env'),
    join(dirname(dirname(startDir)), '.env'),
  ];

  for (const file of candidates) {
    const path = resolve(file);
    if (!existsSync(path) || loaded.includes(path)) continue;
    loadEnvFile(path);
    loaded.push(path);
  }
  return loaded;
}

function loadEnvFile(path: string): void {
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
