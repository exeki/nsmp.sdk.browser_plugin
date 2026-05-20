<script lang="ts" setup>
import PopupContent from '@/components/PopupContent.vue';
import {darkTheme, useOsTheme, NConfigProvider} from "naive-ui";
import { computed } from 'vue';

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null))
</script>

<template>
  <n-config-provider :theme="theme">
    <PopupContent/>
  </n-config-provider>
</template>
