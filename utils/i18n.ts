export const t = (key: string): string => {
  return browser.i18n.getMessage(key) || key;
};