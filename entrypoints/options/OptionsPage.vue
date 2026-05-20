<script lang="ts" setup>

import {darkTheme, useOsTheme, NConfigProvider, NNotificationProvider} from 'naive-ui'
import OptionsContent from "@/components/OptionsContent.vue";

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
</script>

<template>
  <NConfigProvider :theme="theme">
    <NNotificationProvider :max="3">
      <OptionsContent/>
    </NNotificationProvider>
  </NConfigProvider>
</template>

<style scoped>

</style>