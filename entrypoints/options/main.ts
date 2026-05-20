import { createApp } from 'vue';
import {  create } from 'naive-ui';
import './style.css';
import OptionsPage from './OptionsPage.vue';

// Создаем экземпляр Naive UI
const naive = create();

const app = createApp(OptionsPage);
// Регистрируем компоненты Naive UI глобально
app.use(naive);
app.mount('#app');