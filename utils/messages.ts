export type ServerStatus = 'online' | 'offline';

export type UrlUpdatedMessage = {
    type: 'URL_UPDATED';
    url: string;
};

export type ServerStatusUpdateMessage = {
    type: 'SERVER_STATUS_UPDATE';
    status: ServerStatus;
};

export type GetServerStatusMessage = {
    type: 'GET_SERVER_STATUS';
};

export type CheckServerMessage = {
    type: 'CHECK_SERVER';
};

export type ServerStatusResponse = {
    status: ServerStatus;
};

export type RuntimeMessage =
    | UrlUpdatedMessage
    | ServerStatusUpdateMessage
    | GetServerStatusMessage
    | CheckServerMessage;

export function isRuntimeMessage(msg: unknown): msg is RuntimeMessage {
    if (typeof msg !== 'object' || msg === null || !('type' in msg)) return false;
    const type = (msg as { type: unknown }).type;
    return type === 'URL_UPDATED'
        || type === 'SERVER_STATUS_UPDATE'
        || type === 'GET_SERVER_STATUS'
        || type === 'CHECK_SERVER';
}

export const Messages = {
    urlUpdated(url: string): UrlUpdatedMessage {
        return {type: 'URL_UPDATED', url};
    },
    serverStatusUpdate(status: ServerStatus): ServerStatusUpdateMessage {
        return {type: 'SERVER_STATUS_UPDATE', status};
    },
    getServerStatus(): GetServerStatusMessage {
        return {type: 'GET_SERVER_STATUS'};
    },
    checkServer(): CheckServerMessage {
        return {type: 'CHECK_SERVER'};
    },
};
