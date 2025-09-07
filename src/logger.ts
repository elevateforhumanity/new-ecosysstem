/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import pino from 'pino';

// Pino structured logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    }
  } : undefined,
});

// Legacy log interface for backward compatibility
export type LogLevel = "debug" | "info" | "warn" | "error";

let current: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
const order: LogLevel[] = ["debug", "info", "warn", "error"];

export function setLogLevel(level: LogLevel) {
  current = level;
  logger.level = level;
}

function enabled(level: LogLevel) {
  return order.indexOf(level) >= order.indexOf(current);
}

export const log = {
  debug: (...a: unknown[]) => enabled("debug") && logger.debug(a.join(' ')),
  info: (...a: unknown[]) => enabled("info") && logger.info(a.join(' ')),
  warn: (...a: unknown[]) => enabled("warn") && logger.warn(a.join(' ')),
  error: (...a: unknown[]) => enabled("error") && logger.error(a.join(' '))
};