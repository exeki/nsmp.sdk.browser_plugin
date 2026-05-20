<script lang="ts" setup>

import {darkTheme, useOsTheme, NCard, NConfigProvider} from 'naive-ui'
import OptionsContent from "@/components/OptionsContent.vue";

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
</script>

<template>
  <n-config-provider :theme="theme">
    <OptionsContent/>
  </n-config-provider>
</template>

<style scoped>

</style>