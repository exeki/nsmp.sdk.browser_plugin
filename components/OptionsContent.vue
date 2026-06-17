<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {t} from '@/utils/i18n';
import {NButton, NSpace, NForm, NFormItem, NInputNumber, NCard, NTable, NSwitch} from 'naive-ui'
import {settings, ProjectMapping, HostMapping} from '@/utils/settings';


const tableData = ref<HostMapping>({});
const port = ref(0);
const notificationsEnabled = ref(true);

onMounted(async () => {
  try {
    port.value = await settings.getPort()
    notificationsEnabled.value = await settings.getNotificationsEnabled()
    tableData.value = await settings.getProjectMappings()
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
})

watch(port, () => settings.setPort(port.value))
watch(notificationsEnabled, (value) => settings.setNotificationsEnabled(value))
watch(tableData, () => settings.setProjectMappings(tableData.value), {deep: true})

// Метод для добавления проекта
const addProject = () => {
  // Здесь будет логика добавления проекта
  console.log('Add project clicked');
}

// Методы для редактирования и удаления
const editProject = (item: any) => {
  console.log('Edit project:', item);
  // Логика редактирования
};

const deleteProject = (item: any) => {
  settings.deleteProjectMapping(item.host);
};
</script>

<template>

  <NCard :bordered="false" class="options-container">
    <!-- Заголовок -->
    <template #header>
      <h2>{{ t('optionsPageTitle') }}</h2>
    </template>

    <!-- Основное содержимое -->
    <NSpace vertical>
      <NForm label-placement="top">
        <NFormItem :label="t('portSetting')">
          <NInputNumber v-model:value="port"
                        placeholder="Порт сервера"
                        :min="0"
                        :max="65535"
                        :default-value="8123"/>
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
              <NButton size="small" type="primary" @click="editProject(item)">{{ t('edit') }}</NButton>
              <NButton size="small" type="error" @click="deleteProject(item)">{{ t('delete') }}</NButton>
            </NSpace>
          </td>
        </tr>
        </tbody>
      </NTable>
      <NButton type="primary" @click="addProject">{{ t('addProject') }}</NButton>
    </NSpace>

    <!-- Футер -->
    <template #footer>
      <div class="options-footer">
        <small>NSMP SDK Browser Plugin</small>
      </div>
    </template>
  </NCard>
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
</style>