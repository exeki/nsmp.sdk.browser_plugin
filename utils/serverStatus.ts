import {ref} from 'vue';
import {settings} from '@/utils/settings';

const serverStatus = ref<'online' | 'offline' | 'unknown'>('unknown');
const isChecking = ref(false);

// Функция проверки статуса сервера
const checkServerStatus = async (): Promise<'online' | 'offline'> => {
    const port = await settings.getPort();
    if (port === 0) {
        console.log("Port is not set")
        serverStatus.value = 'offline';
        return 'offline';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`http://127.0.0.1:${port}/`, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        serverStatus.value = response.ok ? 'online' : 'offline';
    } catch (error) {
        console.log("Error while checking server status")
        serverStatus.value = 'offline';
        clearTimeout(timeoutId);
    }
    console.log(`Server is ${serverStatus.value}`)
    return serverStatus.value
};

// Ручная проверка
const manualCheck = async () => {
    if (isChecking.value) return;
    isChecking.value = true;
    await checkServerStatus();
    isChecking.value = false;
};

// Автоматическая периодическая проверка
let intervalId: number | null = null;
const startAutoCheck = () => {
    if (intervalId) return;
    intervalId = window.setInterval(() => {
        checkServerStatus();
    }, 10000);
};

const stopAutoCheck = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

export {serverStatus, checkServerStatus, manualCheck, startAutoCheck, stopAutoCheck};