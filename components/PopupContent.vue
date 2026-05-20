<script lang="ts" setup>
import {ref} from 'vue';
import {NSpace, NButton, NInputNumber, NCard} from 'naive-ui';

// Плейсхолдеры для основных функций
const serverStatus = ref('unknown');

// Симуляция состояния сервера
const checkServerStatus = () => {
  serverStatus.value = serverStatus.value === 'online' ? 'offline' : 'online';
};
</script>

<template>
  <NCard class="popup-card" size="small">
    <NButton :type="serverStatus === 'online' ? 'success' : 'error'" size="small" @click="checkServerStatus">
      {{ serverStatus === 'online' ? '●' : '○' }}
    </NButton>

      <!-- Основное содержимое -->
      <div class="popup-content">
        <!-- Блок статуса сервера -->
        <NSpace vertical>
          <h3>Состояние сервера</h3>
          <NButton type="primary" @click="checkServerStatus">Проверить вручную</NButton>
        </NSpace>

        <!-- Блок настроек -->
        <NSpace vertical>
          <NButton type="primary" tag="a" :href="browser.runtime.getURL('options.html')" target="_blank">
            Настройки
          </NButton>
        </NSpace>
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

.popup-header {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

</style>