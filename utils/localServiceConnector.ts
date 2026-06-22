import type {SrcType} from '@/utils/nsdUrl';

const TIMEOUT_MS = 5000;

export interface PullRequest {
    projectPath: string;
    type: SrcType;
    code: string;
}

export interface Project {
    name: string;
    basePath: string;
    nsmpSdk: {
        installationHost: string;
    };
}

interface ProjectsResponse {
    projects: Project[];
}

function buildUrl(port: number, path: string): string {
    return `http://127.0.0.1:${port}${path}`;
}

async function request(port: number, path: string, init: RequestInit = {}): Promise<Response> {
    if (port === 0) {
        throw new Error('Local server disabled (port 0)');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        return await fetch(buildUrl(port, path), {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function checkHealth(port: number): Promise<boolean> {
    if (port === 0) return false;

    try {
        const response = await request(port, '/');
        return response.ok;
    } catch (err) {
        console.log('Health check failed', err);
        return false;
    }
}

export async function getProjects(port: number): Promise<Project[]> {
    const response = await request(port, '/projects');
    if (!response.ok) {
        console.log('GET /projects failed', response.status);
        throw new Error('Failed to fetch projects');
    }

    const data = (await response.json()) as ProjectsResponse;
    return (data.projects ?? []).filter(p => p.nsmpSdk);
}

export async function pull(port: number, body: PullRequest): Promise<void> {
    const response = await request(port, '/pull', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.log('POST /pull failed', response.status, response.statusText);
        throw new Error(`Pull failed: ${response.status}`);
    }
}
