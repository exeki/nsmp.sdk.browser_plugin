<script lang="ts" setup>
import { ref } from 'vue';

// Плейсхолдеры для основных функций
const serverStatus = ref('unknown');
const isSettingsOpen = ref(false);

// Симуляция состояния сервера
const checkServerStatus = () => {
  serverStatus.value = serverStatus.value === 'online' ? 'offline' : 'online';
};
</script>

<template>
  <div class="popup-container">
    <!-- Заголовок -->
    <div class="popup-header">
      <h2>NSMP SDK</h2>
      <button class="status-btn" :class="serverStatus" @click="checkServerStatus">
        {{ serverStatus === 'online' ? '●' : '○' }}
      </button>
    </div>

    <!-- Основное содержимое -->
    <div class="popup-content">
      <!-- Блок статуса сервера -->
      <div class="server-status">
        <h3>Состояние сервера</h3>
        <button class="primary-btn" @click="checkServerStatus">Проверить вручную</button>
      </div>

      <!-- Блок настроек -->
      <div class="settings-section">
        <button class="primary-btn" @click="isSettingsOpen = !isSettingsOpen">
          {{ isSettingsOpen ? 'Скрыть' : 'Показать' }} настройки
        </button>
        <div v-if="isSettingsOpen" class="settings-content">
          <p>Переключатель языка: [RU/EN]</p>
          <p>Порт сервера: <input type="number" value="8123" /></p>
          <h4>Информация о проектах</h4>
          <table border="1">
            <tr><th>Хост</th><th>Проект</th><th>Путь</th><th>Действия</th></tr>
            <tr><td>example.com</td><td>test-project</td><td>C:/projects/test</td><td><button class="action-btn">Ред</button><button class="action-btn">Уд</button></td></tr>
          </table>
          <button class="action-btn">Добавить проект</button>
        </div>
      </div>


    </div>

    <!-- Футер -->
    <div class="popup-footer">
      <small>NSMP SDK Browser Plugin</small>
    </div>
  </div>
</template>

<style scoped>
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --secondary-text-color: #666666;
  --border-color: #eeeeee;
  --button-bg: #007bff;
  --button-hover: #0069d9;
  --button-border: #0062cc;
  --settings-bg: #f9f9f9;
  --header-border: #eeeeee;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --secondary-text-color: #aaaaaa;
    --border-color: #444444;
    --button-bg: #007bff;
    --button-hover: #0069d9;
    --button-border: #0062cc;
    --settings-bg: #2a2a2a;
    --header-border: #444444;
  }
}

.popup-container {
  min-width: 350px;
  padding: 16px;
  font-family: Arial, sans-serif;
  text-align: left;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--header-border);
}

.popup-header h2 {
  margin: 0;
  color: var(--text-color);
}

.status-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  font-size: 12px;
  cursor: pointer;
}

.status-btn.online {
  border-color: #4CAF50;
  color: #4CAF50;
}

.status-btn.offline {
  border-color: #f44336;
  color: #f44336;
}

.popup-content > div {
  margin-bottom: 24px;
}

.popup-content h3 {
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.popup-content p {
  margin: 8px 0;
  color: var(--secondary-text-color);
  font-size: 14px;
}

.primary-btn {
  background: var(--button-bg);
  color: white;
  border: 1px solid var(--button-border);
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.primary-btn:hover {
  background: var(--button-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.action-btn {
  background: #6c757d;
  color: white;
  border: 1px solid #545b62;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.settings-content {
  margin-top: 8px;
  padding: 12px;
  background: var(--settings-bg);
  border-radius: 4px;
}

.settings-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.settings-content th, .settings-content td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.settings-content button {
  margin: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.popup-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  color: var(--secondary-text-color);
  font-size: 12px;
}
</style>