class NotificationService {
    info(title: string, message: string) {
        browser.notifications.create(
            'info',
            {
                type: 'basic',
                iconUrl: 'icon/96.png',
                title: title,
                message: message
            }
        )
    }
}

const notifications = new NotificationService()

export {notifications}