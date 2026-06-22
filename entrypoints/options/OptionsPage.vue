<script lang="ts" setup>
import {darkTheme, useOsTheme, NConfigProvider} from 'naive-ui';
import OptionsContent from '@/components/OptionsContent.vue';

const osTheme = useOsTheme();
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null));
</script>

<template>
  <NConfigProvider :theme="theme">
    <OptionsContent/>
  </NConfigProvider>
</template>
