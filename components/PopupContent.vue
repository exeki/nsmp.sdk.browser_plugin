<script lang="ts" setup>
import {NSpace, NButton, NCard} from 'naive-ui';
import {t} from '@/utils/i18n';
import {notifications} from '@/utils/notifications';
import {
  serverStatus,
  manualCheck,
  checkServerStatus,
  startAutoCheck,
  stopAutoCheck
} from '@/utils/serverStatus';
import {onUnmounted, onMounted} from "vue";
import ProjectMappingSelector from '@/components/ProjectMapping/ProjectMappingSelector.vue';

// Ручная проверка с уведомлением
const handleManualCheck = async () => {
  await manualCheck();
  notifications.info(
      t('manualCheck'),
      (serverStatus.value === 'online' ? t('online') : t('offline')),
  )
};

// Текущий хост
const currentHost = location.hostname;

// Обработка обновления маппинга
const onMappingUpdated = () => {
  notifications.info('Mapping updated', 'Project mapping has been updated');
};

onMounted(() => {
  checkServerStatus()
  startAutoCheck()
});

onUnmounted(() => {
  stopAutoCheck()
});
</script>

<template>
  <NCard class="popup-card" size="small">
    <NButton :type="serverStatus === 'online' ? 'success' : 'error'" size="small">
      {{ serverStatus === 'online' ? '●' : '○' }}
    </NButton>

    <!-- Основное содержимое -->
    <div class="popup-content">
      <!-- Блок статуса сервера -->
      <NSpace vertical>
        <h3>{{ t('serverStatus') }}: {{ serverStatus === 'online' ? t('online') : t('offline') }}</h3>
        <NButton type="primary" @click="handleManualCheck">{{ t('manualCheck') }}</NButton>
      </NSpace>

      <!-- Блок настроек -->
      <NSpace vertical>
        <NButton type="primary" tag="a" :href="browser.runtime.getURL('options.html')" target="_blank">
          {{ t('settings') }}
        </NButton>
      </NSpace>

      <!-- Блок маппинга проектов -->
      <ProjectMappingSelector :current-host="currentHost" @mapping-updated="onMappingUpdated" />

    </div>

    <!-- Футер -->
    <template #footer>
      <div class="popup-footer">
        <small>NSMP SDK Browser Plugin</small>
      </div>
    </template>
  </NCard>
</template>

<style scoped>
.popup-card {
  min-height: 100vh;
  height: 100%;
  min-width: 100vh;
  width: 100%;
  border-radius: 0;
}

</style>