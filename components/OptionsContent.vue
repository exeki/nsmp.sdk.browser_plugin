<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue';
import ProjectTable from '@/components/options/ProjectTable.vue';
import { t } from '@/utils/i18n';
// Состояние настроек
const port = ref(8123);
import {NButton, NSpace, NForm, NFormItem, NInputNumber, NCard, useNotification } from 'naive-ui'

interface TableData {
  key: number;
  host: string;
  project: string;
  path: string;
}

// Данные для таблицы
const tableData = ref<TableData[]>([
  {
    key: 1,
    host: 'example.com',
    project: 'test-project',
    path: 'C:/projects/test'
  }
]);
const notification = useNotification()

// Загрузка сохраненных настроек при монтировании
onMounted(async () => {
  try {
    const result = await browser.storage.sync.get(['port', 'projectMappings']);
    if (result.port !== undefined) port.value = result.port as number;
    if (result.projectMappings) tableData.value = result.projectMappings as TableData[];
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
});

// Сохранение настроек при изменении
const saveSettings = async () => {
  try {
    await browser.storage.sync.set({
      port: port.value,
      projectMappings: tableData.value
    });
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Обновление настроек при изменении значений
watch(port, saveSettings);
watch(tableData, saveSettings, {deep: true});

// Метод для добавления проекта
const addProject = () => {
  // Здесь будет логика добавления проекта
  console.log('Add project clicked');
};

function test(){
  notification.info({
    title: `Notification index: `,
    content: 'You can limit the index of notifications',
    duration: 2000,
  })
}

</script>

<template>

    <NCard :bordered="false" class="options-container">
      <!-- Заголовок -->
      <template #header>
        <h2>{{ t('optionsPageTitle') }}</h2>
      </template>

    <NButton type="primary" @click="test">TEST</NButton>

      <!-- Основное содержимое -->
      <NSpace vertical>
        <NForm label-placement="top">
          <NFormItem :label="t('portSetting')">
            <NInputNumber
                v-model:value="port"
                placeholder="Порт сервера"
                :min="0"
                :max="65535"
                :default-value="8123"
            />
          </NFormItem>
        </NForm>

        <h3>{{ t('projectInfo') }}</h3>
        <ProjectTable :data="tableData"/>
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