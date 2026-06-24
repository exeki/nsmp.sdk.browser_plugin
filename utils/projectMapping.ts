import {getProjects, type Project} from '@/utils/localServiceConnector';
import {settings, type ProjectMapping} from '@/utils/settings';

export type LoadProjectsError = 'port_disabled' | 'load_failed';

export interface LoadProjectsResult {
    projects: Project[];
    error: LoadProjectsError | null;
}

export function normalizeHost(host: string): string {
    return host.trim().toLowerCase();
}

export function filterProjectsByHost(projects: Project[], host: string): Project[] {
    const normalized = normalizeHost(host);
    return projects.filter(p => normalizeHost(p.nsmpSdk.installationHost) === normalized);
}

export function buildProjectSelectOptions(
    projects: Project[],
    selectedPath: string | null,
    fallbackMapping: ProjectMapping | null,
) {
    const opts = projects.map(p => ({
        label: `${p.name} — ${p.basePath}`,
        value: p.basePath,
    }));

    if (selectedPath && !opts.some(o => o.value === selectedPath) && fallbackMapping) {
        opts.unshift({
            label: `${fallbackMapping.name} — ${fallbackMapping.path}`,
            value: fallbackMapping.path,
        });
    }

    return opts;
}

export async function loadProjectsForHost(port: number, host: string): Promise<LoadProjectsResult> {
    if (!host.trim()) {
        return {projects: [], error: null};
    }

    if (port === 0) {
        return {projects: [], error: 'port_disabled'};
    }

    try {
        const data = await getProjects(port);
        return {projects: filterProjectsByHost(data, host), error: null};
    } catch {
        return {projects: [], error: 'load_failed'};
    }
}

export async function applyProjectMapping(
    host: string,
    path: string,
    projects: Project[],
): Promise<ProjectMapping | null> {
    const project = projects.find(p => p.basePath === path);
    if (!project) return null;

    const mapping: ProjectMapping = {
        host,
        name: project.name,
        path: project.basePath,
    };

    await settings.setProjectMapping(mapping);
    return mapping;
}
