const PREFIX = '[NSMP SDK]';

export const log = {
    error: (...args: unknown[]) => console.error(PREFIX, ...args),
    warn: (...args: unknown[]) => console.warn(PREFIX, ...args),
    info: (...args: unknown[]) => console.info(PREFIX, ...args),
};
