import { createApp } from 'vue';
import { create } from 'naive-ui';
import './style.css';
import Popup from './Popup.vue';

// Создаем экземпляр Naive UI
const naive = create();

const app = createApp(Popup);
// Регистрируем компоненты Naive UI глобально
app.use(naive);
app.mount('#app');