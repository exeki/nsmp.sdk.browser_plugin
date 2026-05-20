<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import ProjectTable from '@/components/options/ProjectTable.vue';
// Состояние настроек
const language = ref('ru');
const port = ref(8123);
import {NButton, NSpace, NForm, NFormItem, NInputNumber, NCard, NSelect, useOsTheme, darkTheme} from 'naive-ui'

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

// Загрузка сохраненных настроек при монтировании
onMounted(async () => {
  try {
    const result = await browser.storage.sync.get(['language', 'port', 'projectMappings']);
    if (result.language) language.value = result.language as string;
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
      language: language.value,
      port: port.value,
      projectMappings: tableData.value
    });
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Обновление настроек при изменении значений
watch(language, saveSettings);
watch(port, saveSettings);
watch(tableData, saveSettings, {deep: true});

// Метод для добавления проекта
const addProject = () => {
  // Здесь будет логика добавления проекта
  console.log('Add project clicked');
};

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
</script>

<template>

    <NCard :bordered="false" class="options-container">
      <!-- Заголовок -->
      <template #header>
        <h2>Настройки NSMP SDK</h2>
      </template>

      <!-- Основное содержимое -->
      <NSpace vertical>
        <NForm label-placement="top">
          <NFormItem label="Переключатель языка">
            <NSelect
                v-model:value="language"
                :options="[
              { label: 'Русский', value: 'ru' },
              { label: 'English', value: 'en' }
            ]"
                placeholder="Выберите язык"
            />
          </NFormItem>

          <NFormItem label="Порт локального сервера">
            <NInputNumber
                v-model:value="port"
                placeholder="Порт сервера"
                :min="0"
                :max="65535"
                :default-value="8123"
            />
          </NFormItem>
        </NForm>

        <h3>Информация о локальных проектах</h3>
        <ProjectTable :data="tableData"/>
        <NButton type="primary" @click="addProject">Добавить проект</NButton>
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