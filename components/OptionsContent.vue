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
} from 'naive-ui';
import {settings, type HostMapping, type ProjectMapping} from '@/utils/settings';

const tableData = ref<HostMapping>({});
const port = ref(0);
const notificationsEnabled = ref(true);

const modalVisible = ref(false);
const editingHost = ref<string | null>(null);
const formHost = ref('');
const formName = ref('');
const formPath = ref('');
const formError = ref<string | null>(null);

const isEditing = computed(() => editingHost.value !== null);
const modalTitle = computed(() => (isEditing.value ? t('editProjectTitle') : t('addProjectTitle')));

async function reloadMappings(): Promise<void> {
  settings.clearProjectMappingsCache();
  tableData.value = await settings.getProjectMappings();
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

watch(port, () => settings.setPort(port.value));
watch(notificationsEnabled, (value) => settings.setNotificationsEnabled(value));

onUnmounted(() => {
  browser.storage.onChanged.removeListener(onStorageChanged);
});

function resetForm(): void {
  editingHost.value = null;
  formHost.value = '';
  formName.value = '';
  formPath.value = '';
  formError.value = null;
}

function openAddModal(): void {
  resetForm();
  modalVisible.value = true;
}

function openEditModal(item: ProjectMapping): void {
  editingHost.value = item.host;
  formHost.value = item.host;
  formName.value = item.name;
  formPath.value = item.path;
  formError.value = null;
  modalVisible.value = true;
}

function closeModal(): void {
  modalVisible.value = false;
  resetForm();
}

function validateForm(): boolean {
  if (!formHost.value.trim()) {
    formError.value = t('hostRequired');
    return false;
  }
  if (!formName.value.trim()) {
    formError.value = t('nameRequired');
    return false;
  }
  if (!formPath.value.trim()) {
    formError.value = t('pathRequired');
    return false;
  }
  formError.value = null;
  return true;
}

async function saveProject(): Promise<void> {
  if (!validateForm()) return;

  const mapping: ProjectMapping = {
    host: formHost.value.trim(),
    name: formName.value.trim(),
    path: formPath.value.trim(),
  };

  if (isEditing.value && editingHost.value !== mapping.host) {
    await settings.deleteProjectMapping(editingHost.value!);
  }

  await settings.setProjectMapping(mapping);
  await reloadMappings();
  closeModal();
}

async function deleteProject(item: ProjectMapping): Promise<void> {
  if (!confirm(t('confirmDelete'))) return;

  await settings.deleteProjectMapping(item.host);
  await reloadMappings();
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
      @after-leave="resetForm"
  >
    <NForm label-placement="top">
      <NFormItem :label="t('host')">
        <NInput v-model:value="formHost" :disabled="isEditing"/>
      </NFormItem>
      <NFormItem :label="t('project')">
        <NInput v-model:value="formName"/>
      </NFormItem>
      <NFormItem :label="t('path')">
        <NInput v-model:value="formPath"/>
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
  margin: 0;
  font-size: 12px;
  color: #d03050;
}
</style>
