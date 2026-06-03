import {log} from '@/utils/logger';

export type SrcApiType = 'module' | 'script' | 'advImport';

export interface SrcPageContext {
    apiType: SrcApiType;
    name: string;
}

export interface HistoryItem {
    categoryName: string;
    category: string;
    actionDate: string;
    authorLogin: string;
    description: string;
    uuid: string;
}

export interface HistoryPageResponse {
    page: number;
    pageSize: number;
    total: number;
    items: HistoryItem[];
}

const HASH_RE = /^#(scriptModule|script|advImportConfig):([^#]+)$/;

const HASH_TO_API: Record<string, SrcApiType> = {
    scriptModule: 'module',
    script: 'script',
    advImportConfig: 'advImport',
};

const PAGE_SIZE = 20;

export function parseSrcPage(loc: Location): SrcPageContext | null {
    if (!loc.pathname.includes('/sd/admin')) return null;
    const match = loc.hash.match(HASH_RE);
    if (!match) return null;
    const apiType = HASH_TO_API[match[1]];
    if (!apiType) return null;
    return {apiType, name: decodeURIComponent(match[2])};
}

export function buildHistoryUrl(page: number, apiType: SrcApiType, name: string): string {
    const params = new URLSearchParams({
        func: 'modules.sdkController.getSrcHistory',
        params: '',
        page: String(page),
        pageSize: String(PAGE_SIZE),
        type: apiType,
        name,
    });
    return `${location.origin}/sd/services/rest/exec?${params}`;
}

export async function fetchHistoryPage(
    apiType: SrcApiType,
    name: string,
    page: number,
): Promise<HistoryPageResponse | null> {
    try {
        const response = await fetch(buildHistoryUrl(page, apiType, name), {
            credentials: 'include',
        });
        if (!response.ok) {
            log.error('History request failed', response.status, response.statusText);
            return null;
        }
        const data = (await response.json()) as HistoryPageResponse;
        if (!Array.isArray(data.items)) {
            log.error('Invalid history response', data);
            return null;
        }
        return data;
    } catch (err) {
        log.error('History request error', err);
        return null;
    }
}

export function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function truncateText(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max)}…`;
}

export function formatDescriptionPreview(description: string): string {
    return truncateText(stripHtml(description), 100);
}

export function adminLogRecordUrl(uuid: string): string {
    return `${location.origin}/sd/admin/#adminLogRecord:${uuid}`;
}
