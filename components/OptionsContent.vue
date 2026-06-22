<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {t} from '@/utils/i18n';
import {
  NButton,
  NSpace,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NCard,
  NTable,
  NSwitch,
  NModal,
  NSelect,
} from 'naive-ui';
import {getProjects, type Project} from '@/utils/localServiceConnector';
import {
  applyProjectMapping,
  buildProjectSelectOptions,
  filterProjectsByHost,
} from '@/utils/projectMapping';
import {settings, type HostMapping, type ProjectMapping} from '@/utils/settings';

const tableData = ref<HostMapping>({});
const port = ref(0);
const notificationsEnabled = ref(true);

const modalVisible = ref(false);
const editingHost = ref<string | null>(null);
const editingMapping = ref<ProjectMapping | null>(null);
const formHost = ref('');
const selectedProjectPath = ref<string | null>(null);
const projects = ref<Project[]>([]);
const projectsLoading = ref(false);
const projectsError = ref<string | null>(null);
const formError = ref<string | null>(null);

const isEditing = computed(() => editingHost.value !== null);
const modalTitle = computed(() => (isEditing.value ? t('editProjectTitle') : t('addProjectTitle')));

const projectOptions = computed(() =>
    buildProjectSelectOptions(projects.value, selectedProjectPath.value, editingMapping.value),
);

async function reloadMappings(): Promise<void> {
  settings.clearProjectMappingsCache();
  tableData.value = await settings.getProjectMappings();
}

async function loadModalProjects(host: string): Promise<void> {
  const trimmedHost = host.trim();
  if (!trimmedHost) {
    projects.value = [];
    projectsError.value = null;
    return;
  }

  projectsLoading.value = true;
  projectsError.value = null;

  try {
    const currentPort = port.value || await settings.getPort();
    if (currentPort === 0) {
      projects.value = [];
      projectsError.value = t('serverPortDisabled');
      return;
    }

    const data = await getProjects(currentPort);
    projects.value = filterProjectsByHost(data, trimmedHost);
  } catch {
    projects.value = [];
    projectsError.value = t('projectsLoadFailed');
  } finally {
    projectsLoading.value = false;
  }
}

function refreshModalProjects(): void {
  const host = formHost.value.trim();
  if (modalVisible.value && host) {
    void loadModalProjects(host);
  }
}

function onStorageChanged(
    changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
    area: string,
): void {
  if (area !== 'local' || !changes.projectMappings) return;
  void reloadMappings();
}

onMounted(async () => {
  try {
    port.value = await settings.getPort();
    notificationsEnabled.value = await settings.getNotificationsEnabled();
    tableData.value = await settings.getProjectMappings();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  browser.storage.onChanged.addListener(onStorageChanged);
});

watch(port, () => {
  settings.setPort(port.value);
  refreshModalProjects();
});

watch(notificationsEnabled, (value) => settings.setNotificationsEnabled(value));

watch(modalVisible, (visible) => {
  if (visible) refreshModalProjects();
});

watch(() => formHost.value.trim(), (host) => {
  if (!modalVisible.value) return;

  if (host) {
    void loadModalProjects(host);
  } else {
    projects.value = [];
    selectedProjectPath.value = null;
    projectsError.value = null;
  }
});

onUnmounted(() => {
  browser.storage.onChanged.removeListener(onStorageChanged);
});

function resetForm(): void {
  editingHost.value = null;
  editingMapping.value = null;
  formHost.value = '';
  selectedProjectPath.value = null;
  projects.value = [];
  projectsLoading.value = false;
  projectsError.value = null;
  formError.value = null;
}

function openAddModal(): void {
  resetForm();
  modalVisible.value = true;
}

function openEditModal(item: ProjectMapping): void {
  resetForm();
  editingHost.value = item.host;
  editingMapping.value = item;
  formHost.value = item.host;
  selectedProjectPath.value = item.path;
  modalVisible.value = true;
}

function closeModal(): void {
  modalVisible.value = false;
  resetForm();
}

async function saveProject(): Promise<void> {
  const host = formHost.value.trim();

  if (!host) {
    formError.value = t('hostRequired');
    return;
  }

  if (!selectedProjectPath.value) {
    formError.value = t('selectProject');
    return;
  }

  const mapping = await applyProjectMapping(host, selectedProjectPath.value, projects.value);
  if (!mapping) {
    formError.value = t('projectsLoadFailed');
    return;
  }

  if (isEditing.value && editingHost.value !== host) {
    await settings.deleteProjectMapping(editingHost.value!);
  }

  await reloadMappings();
  closeModal();
}

async function deleteProject(item: ProjectMapping): Promise<void> {
  if (!confirm(t('confirmDelete'))) return;

  await settings.deleteProjectMapping(item.host);
  await reloadMappings();
}

async function onProjectSelect(path: string | null): Promise<void> {
  selectedProjectPath.value = path;
}

</script>

<template>
  <NCard :bordered="false" class="options-container">
    <template #header>
      <h2>{{ t('optionsPageTitle') }}</h2>
    </template>

    <NSpace vertical>
      <NForm label-placement="top">
        <NFormItem :label="t('portSetting')">
          <NInputNumber
              v-model:value="port"
              :min="0"
              :max="65535"
          />
        </NFormItem>
        <NFormItem :label="t('notificationsSetting')">
          <NSwitch v-model:value="notificationsEnabled"/>
        </NFormItem>
      </NForm>

      <h3>{{ t('projectInfo') }}</h3>
      <NTable :bordered="true" :single-line="false" size="small">
        <thead>
        <tr>
          <th>{{ t('host') }}</th>
          <th>{{ t('project') }}</th>
          <th>{{ t('path') }}</th>
          <th>{{ t('actions') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in Object.values(tableData)" :key="item.host">
          <td>{{ item.host }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.path }}</td>
          <td>
            <NSpace size="small">
              <NButton size="small" type="primary" @click="openEditModal(item)">{{ t('edit') }}</NButton>
              <NButton size="small" type="error" @click="deleteProject(item)">{{ t('delete') }}</NButton>
            </NSpace>
          </td>
        </tr>
        </tbody>
      </NTable>
      <NButton type="primary" @click="openAddModal">{{ t('addProject') }}</NButton>
    </NSpace>

    <template #footer>
      <div class="options-footer">
        <small>NSMP SDK Browser Plugin</small>
      </div>
    </template>
  </NCard>

  <NModal
      v-model:show="modalVisible"
      preset="card"
      :title="modalTitle"
      style="width: 480px"
      @after-leave="resetForm">
    <NForm label-placement="top">
      <NFormItem :label="t('host')">
        <NInput v-model:value="formHost" :disabled="isEditing"/>
      </NFormItem>
      <NFormItem :label="t('project')">
    <NSelect :value="selectedProjectPath"
            :options="projectOptions"
            :loading="projectsLoading"
            :placeholder="t('selectProject')"
            :to="false"
            filterable
            clearable
           @update:value="onProjectSelect"/>
        <p v-if="projectsError" class="form-error">{{ projectsError }}</p>
      </NFormItem>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">{{ t('cancel') }}</NButton>
        <NButton type="primary" @click="saveProject">{{ t('save') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.options-container {
  min-width: 500px;
  min-height: 100vh;
  height: 100%;
  border-radius: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.options-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 12px;
}

.form-error {
  margin: 4px 0 0;
  font-size: 12px;
  color: #d03050;
}
</style>
