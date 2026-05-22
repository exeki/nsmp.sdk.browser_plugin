<script lang="ts" setup>
import PopupContent from '@/components/PopupContent.vue';
import {darkTheme, useOsTheme, NConfigProvider, NNotificationProvider} from "naive-ui";
import {computed} from 'vue';

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
</script>

<template>
  <NConfigProvider :theme="theme">
    <NNotificationProvider :max="3" placement="bottom-right">
      <PopupContent/>
    </NNotificationProvider>
  </NConfigProvider>
</template>
