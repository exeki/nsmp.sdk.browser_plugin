<script lang="ts" setup>
import { defineProps } from 'vue';
import { NTable, NButton, NSpace } from 'naive-ui'
import { t } from '@/utils/i18n';
import {ProjectMapping, settings} from "@/utils/settings";

interface Props {
  data: Map<string, ProjectMapping>;
}

// Определение пропсов
const props = defineProps<Props>();

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
      <tr v-for="item in props.data.values()" :key="item.host">
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
</template>

<style scoped>
/* Дополнительные стили при необходимости */
</style>