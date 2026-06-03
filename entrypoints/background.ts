let serverStatus = 'unknown';

const updateIcon = () => {
    const iconPath = serverStatus === 'online'
        ? 'icon/128.png'
        : 'icon/128.png';

    browser.action.setIcon({
        path: {
            "16": iconPath.replace('128', '16'),
            "32": iconPath.replace('128', '32'),
            "48": iconPath.replace('128', '48'),
            "96": iconPath.replace('128', '96'),
            "128": iconPath
        }
    }).catch(err => console.error('Failed to set icon:', err));
}

// Инициализация при старте
export default defineBackground(() => {
    console.log('Hello background!', {id: browser.runtime.id});

    // Устанавливаем начальную иконку
    updateIcon();

    // Слушаем сообщения от popup
    browser.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'SHOW_NOTIFICATION') {
            console.log("Got notification event")
            browser.notifications.create({
                type: 'basic',
                iconUrl: 'icon/128.png',
                title: msg.payload.title,
                message: msg.payload.message,
            });
        } else if (msg.type === 'SERVER_STATUS_UPDATE') {
            serverStatus = msg.status;
            updateIcon();
        }
    })

    // Периодическая проверка каждые 10 секунд
    setInterval(async () => {
        try {
            const port = (await browser.storage.local.get('port')).port || 8123;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`http://127.0.0.1:${port}/`, {
                method: 'GET',
                signal: controller.signal,
            })

            clearTimeout(timeoutId);

            const newStatus = response.ok ? 'online' : 'offline';
            if (newStatus !== serverStatus) {
                serverStatus = newStatus;
                updateIcon();

                // Оповещаем popup, если нужно
                browser.runtime.sendMessage({
                    type: 'SERVER_STATUS_UPDATE',
                    status: serverStatus
                }).catch(() => {
                })
            }
        } catch (error) {
            if (serverStatus !== 'offline') {
                serverStatus = 'offline';
                updateIcon();

                browser.runtime.sendMessage({
                    type: 'SERVER_STATUS_UPDATE',
                    status: serverStatus
                }).catch(() => {
                })
            }
        }
    }, 10000);
})

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    console.log("browser.tabs.onUpdated")
    if (changeInfo.status === 'complete' && tab.active && tab.url) {
        browser.runtime.sendMessage({
            type: 'URL_UPDATED',
            url: tab.url
        })
    }
})

browser.tabs.onActivated.addListener(async (activeInfo) => {
    console.log("browser.tabs.onActivate")
    const tab = await browser.tabs.get(activeInfo.tabId);
    browser.runtime.sendMessage({
        type: 'URL_UPDATED',
        url: tab.url
    })
})