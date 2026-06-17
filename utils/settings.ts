const PORT_KEY = "port"
const PROJECT_MAPPINGS_KEY = "projectMappings"
const HISTORY_PANEL_COLLAPSED_KEY = "historyPanelCollapsed"
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled"

const DEFAULT_SETTINGS = {
    [PORT_KEY]: 8123,
    [PROJECT_MAPPINGS_KEY]: {},
    [HISTORY_PANEL_COLLAPSED_KEY]: false,
    [NOTIFICATIONS_ENABLED_KEY]: true,
}

interface ProjectMapping {
    host: string
    name: string
    path: string
}

// Тип для объекта с произвольными строковыми ключами
interface HostMapping {
    [host: string]: ProjectMapping;
}

class Settings {

    private port: number | undefined

    private projectMappings: HostMapping | undefined

    async getPort(): Promise<number> {
        if (this.port != undefined) return this.port
        this.port = (await browser.storage.local.get(PORT_KEY))[PORT_KEY] as number
        if (this.port != undefined) return this.port
        this.port = DEFAULT_SETTINGS[PORT_KEY] as number
        return this.port
    }

    async setPort(port: number): Promise<void> {
        this.port = port
        await browser.storage.local.set({[PORT_KEY]: port})
    }

    async getProjectMappings(): Promise<HostMapping> {
        if (this.projectMappings != undefined) return this.projectMappings
        this.projectMappings = (await browser.storage.local.get(PROJECT_MAPPINGS_KEY))[PROJECT_MAPPINGS_KEY] as HostMapping
        if (this.projectMappings != undefined) return this.projectMappings
        this.projectMappings = DEFAULT_SETTINGS[PROJECT_MAPPINGS_KEY]
        return this.projectMappings
    }

    async setProjectMappings(projectMappings: HostMapping) {
        this.projectMappings = projectMappings
        await browser.storage.local.set({[PROJECT_MAPPINGS_KEY]: projectMappings})
    }

    async setProjectMapping(projectMapping: ProjectMapping): Promise<void> {
        const projectMappings = await this.getProjectMappings()
        projectMappings[(projectMapping.host)] = projectMapping
        await this.setProjectMappings(projectMappings)
    }

    async getProjectMapping(host: string): Promise<ProjectMapping | undefined> {
        return (await this.getProjectMappings())[host]
    }

    async deleteProjectMapping(host: string): Promise<void> {
        const projectMappings = await this.getProjectMappings()
        delete projectMappings[(host)]
        await this.setProjectMappings(projectMappings)
    }

    async getHistoryPanelCollapsed(): Promise<boolean> {
        const stored = (await browser.storage.local.get(HISTORY_PANEL_COLLAPSED_KEY))[HISTORY_PANEL_COLLAPSED_KEY]
        return stored === true
    }

    async setHistoryPanelCollapsed(collapsed: boolean): Promise<void> {
        await browser.storage.local.set({[HISTORY_PANEL_COLLAPSED_KEY]: collapsed})
    }

    async getNotificationsEnabled(): Promise<boolean> {
        const stored = (await browser.storage.local.get(NOTIFICATIONS_ENABLED_KEY))[NOTIFICATIONS_ENABLED_KEY]
        return stored !== false
    }

    async setNotificationsEnabled(enabled: boolean): Promise<void> {
        await browser.storage.local.set({[NOTIFICATIONS_ENABLED_KEY]: enabled})
    }
}

const settings = new Settings()

export {settings, ProjectMapping, HostMapping}