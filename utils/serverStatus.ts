import {ref} from 'vue';
import {Messages, isRuntimeMessage, type ServerStatus, type ServerStatusResponse} from '@/utils/messages';

const serverStatus = ref<ServerStatus | 'unknown'>('unknown');
const isChecking = ref(false);

let listenerAttached = false;

const applyStatus = (status: ServerStatus): void => {
    serverStatus.value = status;
};

const onRuntimeMessage = (msg: unknown): void => {
    if (!isRuntimeMessage(msg) || msg.type !== 'SERVER_STATUS_UPDATE') return;
    applyStatus(msg.status);
};

const initServerStatus = async (): Promise<void> => {
    if (!listenerAttached) {
        browser.runtime.onMessage.addListener(onRuntimeMessage);
        listenerAttached = true;
    }

    try {
        const response = await browser.runtime.sendMessage(Messages.getServerStatus()) as ServerStatusResponse | undefined;
        if (response?.status) applyStatus(response.status);
    } catch {
        // background may be unavailable during extension reload
    }
};

const disposeServerStatus = (): void => {
    if (!listenerAttached) return;
    browser.runtime.onMessage.removeListener(onRuntimeMessage);
    listenerAttached = false;
};

const manualCheck = async (): Promise<void> => {
    if (isChecking.value) return;
    isChecking.value = true;
    try {
        const response = await browser.runtime.sendMessage(Messages.checkServer()) as ServerStatusResponse | undefined;
        if (response?.status) applyStatus(response.status);
    } finally {
        isChecking.value = false;
    }
};

export {serverStatus, initServerStatus, disposeServerStatus, manualCheck};
