<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { NTable, NButton, NSpace } from 'naive-ui'

interface DataItem {
  key: number;
  host: string;
  project: string;
  path: string;
}

interface Props {
  data: DataItem[];
}

// Определение пропсов
const props = defineProps<Props>();

// Определение событий
const emit = defineEmits(['update-data']);

// Методы для редактирования и удаления
const editProject = (item: any) => {
  console.log('Edit project:', item);
  // Логика редактирования
};

const deleteProject = (item: any) => {
  const newData = props.data.filter((project: any) => project.key !== item.key);
  emit('update-data', newData);
};
</script>

<template>
  <NTable :bordered="true" :single-line="false" size="small">
    <thead>
      <tr>
        <th>Хост</th>
        <th>Проект</th>
        <th>Путь</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in props.data" :key="item.key">
        <td>{{ item.host }}</td>
        <td>{{ item.project }}</td>
        <td>{{ item.path }}</td>
        <td>
          <NSpace size="small">
            <NButton size="small" type="primary" @click="editProject(item)">Ред</NButton>
            <NButton size="small" type="error" @click="deleteProject(item)">Уд</NButton>
          </NSpace>
        </td>
      </tr>
    </tbody>
  </NTable>
</template>

<style scoped>
/* Дополнительные стили при необходимости */
</style>