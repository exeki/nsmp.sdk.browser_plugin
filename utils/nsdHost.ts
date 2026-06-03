/** NSD installation host for content script matches (single host). */
export const NSD_HOST = 'nsd1.exeki.local';

export const NSD_CONTENT_MATCHES = [`*://${NSD_HOST}/*/sd/admin*`] as const;
