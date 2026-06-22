import {settings} from '@/utils/settings';

async function show(title: string, message: string): Promise<void> {
    if (!(await settings.getNotificationsEnabled())) return;

    await browser.notifications.create({
        type: 'basic',
        iconUrl: 'icon/96.png',
        title,
        message,
    });
}

class NotificationService {
    info(title: string, message: string): void {
        void show(title, message);
    }

    error(title: string, message: string): void {
        void show(title, message);
    }
}

const notifications = new NotificationService();

export {notifications};
