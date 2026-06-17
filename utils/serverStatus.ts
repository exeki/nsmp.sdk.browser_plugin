import {ref} from 'vue';
import {checkHealth} from '@/utils/localServiceConnector';
import {settings} from '@/utils/settings';

const serverStatus = ref<'online' | 'offline' | 'unknown'>('unknown');
const isChecking = ref(false);

const checkServerStatus = async (): Promise<'online' | 'offline'> => {
    const port = await settings.getPort();
    const online = await checkHealth(port);
    serverStatus.value = online ? 'online' : 'offline';
    console.log(`Server is ${serverStatus.value}`);
    return serverStatus.value;
};

const manualCheck = async () => {
    if (isChecking.value) return;
    isChecking.value = true;
    await checkServerStatus();
    isChecking.value = false;
};

let intervalId: number | null = null;

const startAutoCheck = () => {
    if (intervalId) return;
    intervalId = window.setInterval(() => {
        void checkServerStatus();
    }, 10000);
};

const stopAutoCheck = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

export {serverStatus, checkServerStatus, manualCheck, startAutoCheck, stopAutoCheck};
