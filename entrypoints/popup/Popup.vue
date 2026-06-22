<script lang="ts" setup>
import PopupContent from '@/components/PopupContent.vue';
import {darkTheme, NConfigProvider} from 'naive-ui';
import {computed, onMounted, onUnmounted, ref} from 'vue';

const darkMql = window.matchMedia('(prefers-color-scheme: dark)');
const isDark = ref(darkMql.matches);
const theme = computed(() => (isDark.value ? darkTheme : null));

const onThemeChange = (e: MediaQueryListEvent) => {
  isDark.value = e.matches;
};

onMounted(() => {
  isDark.value = darkMql.matches;
  darkMql.addEventListener('change', onThemeChange);
});

onUnmounted(() => {
  darkMql.removeEventListener('change', onThemeChange);
});
</script>

<template>
  <NConfigProvider :theme="theme" class="popup-root">
    <PopupContent/>
  </NConfigProvider>
</template>

<style scoped>
.popup-root {
  display: block;
  min-height: 100%;
  background: var(--popup-bg);
  color: var(--popup-text);
}
</style>
