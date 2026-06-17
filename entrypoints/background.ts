import {checkHealth} from '@/utils/localServiceConnector';
import {Messages, isRuntimeMessage, type ServerStatus} from '@/utils/messages';
import {show} from '@/utils/notifications';

let serverStatus: ServerStatus | 'unknown' = 'unknown';

const updateIcon = () => {
    const iconPath = serverStatus === 'online'
        ? 'icon/128.png'
        : 'icon/128.png';

    browser.action.setIcon({
        path: {
            '16': iconPath.replace('128', '16'),
            '32': iconPath.replace('128', '32'),
            '48': iconPath.replace('128', '48'),
            '96': iconPath.replace('128', '96'),
            '128': iconPath,
        },
    }).catch(err => console.log('Failed to set icon', err));
};

const broadcastStatus = (status: ServerStatus) => {
    browser.runtime.sendMessage(Messages.serverStatusUpdate(status)).catch(() => {});
};

export default defineBackground(() => {
    updateIcon();

    browser.runtime.onMessage.addListener((msg) => {
        if (!isRuntimeMessage(msg)) return;

        if (msg.type === 'SHOW_NOTIFICATION') {
            void show(msg.payload.title, msg.payload.message);
        } else if (msg.type === 'SERVER_STATUS_UPDATE') {
            serverStatus = msg.status;
            updateIcon();
        }
    });

    setInterval(async () => {
        const port = (await browser.storage.local.get('port')).port ?? 8123;
        const online = await checkHealth(Number(port));
        const newStatus: ServerStatus = online ? 'online' : 'offline';

        if (newStatus !== serverStatus) {
            serverStatus = newStatus;
            updateIcon();
            broadcastStatus(newStatus);
        }
    }, 10000);
});

browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active && tab.url) {
        browser.runtime.sendMessage(Messages.urlUpdated(tab.url)).catch(() => {});
    }
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.url) {
        browser.runtime.sendMessage(Messages.urlUpdated(tab.url)).catch(() => {});
    }
});
