type MessageKey = Parameters<typeof browser.i18n.getMessage>[0];

export const t = (key: MessageKey): string => browser.i18n.getMessage(key) || key;
