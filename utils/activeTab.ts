export function hostFromTabUrl(url: string | undefined): string | null {
    if (!url?.startsWith('http')) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

export async function getActiveTabHost(): Promise<string | null> {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    return hostFromTabUrl(tab?.url);
}
