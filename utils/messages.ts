export type ServerStatus = 'online' | 'offline';

export type UrlUpdatedMessage = {
    type: 'URL_UPDATED';
    url: string;
};

export type ServerStatusUpdateMessage = {
    type: 'SERVER_STATUS_UPDATE';
    status: ServerStatus;
};

export type ShowNotificationMessage = {
    type: 'SHOW_NOTIFICATION';
    payload: {
        title: string;
        message: string;
    };
};

export type RuntimeMessage =
    | UrlUpdatedMessage
    | ServerStatusUpdateMessage
    | ShowNotificationMessage;

export function isRuntimeMessage(msg: unknown): msg is RuntimeMessage {
    if (typeof msg !== 'object' || msg === null || !('type' in msg)) return false;
    const type = (msg as { type: unknown }).type;
    return type === 'URL_UPDATED'
        || type === 'SERVER_STATUS_UPDATE'
        || type === 'SHOW_NOTIFICATION';
}

export const Messages = {
    urlUpdated(url: string): UrlUpdatedMessage {
        return {type: 'URL_UPDATED', url};
    },
    serverStatusUpdate(status: ServerStatus): ServerStatusUpdateMessage {
        return {type: 'SERVER_STATUS_UPDATE', status};
    },
    showNotification(title: string, message: string): ShowNotificationMessage {
        return {type: 'SHOW_NOTIFICATION', payload: {title, message}};
    },
};
