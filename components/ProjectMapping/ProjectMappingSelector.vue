<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue';
import {NFormItem, NAlert, useMessage, NSelect} from 'naive-ui';
import {notifications} from '@/utils/notifications';
import {settings, ProjectMapping, HostMapping} from '@/utils/settings';
import Project from "@/utils/model/Project";

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'URL_UPDATED' && msg.url && msg.url.startsWith('http')) {
    updateHost(msg.url)
  }
})

function updateHost(url: string) {
  const newHost = new URL(url).hostname
  if (currentHost.value != newHost) {
    loadProjects()
    console.log(`URL updated to ${newHost}`)
    currentMapping.value = mappings.value[newHost]
    currentHost.value = newHost
  }
}

// Реактивные данные
const mappings = ref<HostMapping>({})
const isLoading = ref(false)
const error = ref<string | null>(null)
const projects = ref<Project[]>([])
const currentMapping = ref<ProjectMapping | undefined>()
const currentHost = ref<string | null>(location.hostname)

// Загрузка маппингов
const loadMappings = async () => {
  isLoading.value = true
  error.value = null
  try {
    mappings.value = await settings.getProjectMappings()
  } catch (err) {
    console.error('Failed to load mappings:', err)
    error.value = 'Failed to load project mappings'
    notifications.info('Error', 'Cannot load project mappings')
  } finally {
    isLoading.value = false
  }
}

const handleSelect = (path: string | null) => {
  const project = projects.value.find(p => p.basePath === path)!!
  const projectMapping: ProjectMapping = {
    host: project.nsmpSdk.installationHost,
    name: project.name,
    path: project.basePath
  }
  console.log("selected")
  settings.setProjectMapping(projectMapping)
}

onMounted(() => {
  loadMappings()
  loadProjects()
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    const tab = tabs[0]
    if (tab != undefined && tab.url != undefined) updateHost(tab.url)
  })
})

// Загрузка проектов
async function loadProjects() {
  isLoading.value = true
  error.value = null
  try {
    const port = await settings.getPort()
    if (port === 0) {
      error.value = 'Local server port is not set'
      return
    }
    const response = await fetch(`http://127.0.0.1:${port}/projects`)
    if (!response.ok) throw new Error('Failed to fetch projects')

    const data = await response.json()
    projects.value = data.projects
        .filter((p: any) => p.nsmpSdk)
        .filter((p: any) => p.nsmpSdk.installationHost == currentHost.value) as Project[]
  } catch (err) {
    console.error('Failed to load projects:', err)
    error.value = 'Failed to connect to local server'
    notifications.info('Error', 'Cannot load projects list')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="project-mapping-selector">
    <h3>Project Mapping</h3>

    <NFormItem label="Current Host">
      <span>{{ currentHost }}</span>
    </NFormItem>

    <NFormItem label="Project">
      <NSelect :options="projects"
               :loading="isLoading"
               value-field="basePath"
               key-field="basePath"
               label-field="basePath"
               placeholder="Select project..."
               @update:value="handleSelect"
               filterable/>
      <NAlert v-if="error"
              type="error"
              :show-icon="false"
              style="margin-top: 8px">{{ error }}
      </NAlert>
    </NFormItem>

    <NAlert v-if="error" type="error" :show-icon="false" style="margin-top: 8px">{{ error }}</NAlert>
  </div>
</template>

<style scoped>
.project-mapping-selector {
  margin-top: 16px;
}
</style>