import fs from 'node:fs';
import { config } from './config.js';

function ensureLogsDir() {
  fs.mkdirSync(config.paths.logsDir, { recursive: true });
}

function formatEntry({ filename, title, status, details }) {
  const timestamp = new Date().toISOString();
  const lines = [
    `[${timestamp}] status=${status} file=${filename} title="${title || ''}"`,
  ];
  if (details) lines.push(`  ${details}`);
  return lines.join('\n') + '\n';
}

export function logSuccess({ filename, title, status, details }) {
  ensureLogsDir();
  fs.appendFileSync(config.paths.successLog, formatEntry({ filename, title, status, details }));
}

export function logError({ filename, title, status, details }) {
  ensureLogsDir();
  fs.appendFileSync(config.paths.errorLog, formatEntry({ filename, title, status, details }));
}
