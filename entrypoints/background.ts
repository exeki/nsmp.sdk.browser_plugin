import {checkHealth} from '@/utils/localServiceConnector';
import {
    Messages,
    isRuntimeMessage,
    type ServerStatus,
    type ServerStatusResponse,
} from '@/utils/messages';
import {settings} from '@/utils/settings';

const CHECK_INTERVAL_MS = 10000;
const ICON_ONLINE = 'icon/128.png';
const ICON_OFFLINE = 'icon-gray/128.png';

let serverStatus: ServerStatus | 'unknown' = 'unknown';

const updateIcon = (): void => {
    const iconPath = serverStatus === 'online' ? ICON_ONLINE : ICON_OFFLINE;

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

const broadcastStatus = (status: ServerStatus): void => {
    browser.runtime.sendMessage(Messages.serverStatusUpdate(status)).catch(() => {});
};

const runHealthCheck = async (forceBroadcast = false): Promise<ServerStatus> => {
    const port = await settings.getPort();
    const online = await checkHealth(port);
    const newStatus: ServerStatus = online ? 'online' : 'offline';

    if (newStatus !== serverStatus || forceBroadcast) {
        serverStatus = newStatus;
        updateIcon();
        broadcastStatus(newStatus);
    }

    return newStatus;
};

export default defineBackground(() => {
    updateIcon();
    void runHealthCheck(true);

    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
        if (!isRuntimeMessage(msg)) return;

        if (msg.type === 'GET_SERVER_STATUS') {
            const response: ServerStatusResponse = {
                status: serverStatus === 'unknown' ? 'offline' : serverStatus,
            };
            sendResponse(response);
            return true;
        }

        if (msg.type === 'CHECK_SERVER') {
            void runHealthCheck(true).then((status) => {
                sendResponse({status} satisfies ServerStatusResponse);
            });
            return true;
        }
    });

    browser.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;

        if (changes.port) {
            settings.clearPortCache();
            void runHealthCheck(true);
        }

        if (changes.projectMappings) {
            settings.clearProjectMappingsCache();
        }
    });

    setInterval(() => {
        void runHealthCheck();
    }, CHECK_INTERVAL_MS);

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
});
