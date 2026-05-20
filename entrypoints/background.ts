import { useNotification } from 'naive-ui'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_NOTIFICATION') {
      console.log("Got notification event")
      browser.notifications.create({
        type: 'basic',
        iconUrl: 'icon/128.png',
        title: msg.payload.title,
        message: msg.payload.message,
      });
    }
  });
});
