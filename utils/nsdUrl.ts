export interface SrcPageContext {
    apiType: SrcType;
    name: string;
}

const HASH_RE = /^#(scriptModule|script|advImportConfig):([^#]+)$/;

export type SrcType = 'module' | 'script' | 'advImport';

const HASH_TO_API: Record<string, SrcType> = {
    scriptModule: 'module',
    script: 'script',
    advImportConfig: 'advImport',
};

type UrlLike = Pick<Location, 'pathname' | 'hash'>;

/** Hostname if URL path starts with /sd/, otherwise null. */
export function extractNsdHost(url: string): string | null {
    try {
        const {hostname, pathname} = new URL(url);
        const firstSegment = pathname.split('/').find(Boolean);
        return firstSegment === 'sd' ? hostname : null;
    } catch {
        return null;
    }
}

export function parseSrcPage(loc: UrlLike): SrcPageContext | null {
    if (!loc.pathname.includes('/sd/admin')) return null;
    const match = loc.hash.match(HASH_RE);
    if (!match) return null;
    const apiType = HASH_TO_API[match[1]];
    if (!apiType) return null;
    return {apiType, name: decodeURIComponent(match[2])};
}