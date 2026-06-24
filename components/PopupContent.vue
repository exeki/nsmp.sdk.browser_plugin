<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {NButton, NSelect} from 'naive-ui';
import {t} from '@/utils/i18n';
import {extractNsdHost, parseSrcPage, type SrcPageContext} from '@/utils/nsdUrl';
import {pull, type Project} from '@/utils/localServiceConnector';
import {
  applyProjectMapping,
  buildProjectSelectOptions,
  loadProjectsForHost,
} from '@/utils/projectMapping';
import {notifications} from '@/utils/notifications';
import {isRuntimeMessage} from '@/utils/messages';
import {settings, type ProjectMapping} from '@/utils/settings';
import {disposeServerStatus, initServerStatus, manualCheck, serverStatus} from '@/utils/serverStatus';

const NONE = () => t('none');
const optionsUrl = browser.runtime.getURL('/options.html');

const port = ref(0);
const currentHost = ref<string | null>(null);
const currentSrc = ref<string>(NONE());
const currentSrcContext = ref<SrcPageContext | null>(null);
const selectedProjectPath = ref<string | null>(null);
const currentMapping = ref<ProjectMapping | null>(null);
const projects = ref<Project[]>([]);
const projectsLoading = ref(false);
const projectsError = ref<string | null>(null);
const pulling = ref(false);

const projectOptions = computed(() =>
    buildProjectSelectOptions(projects.value, selectedProjectPath.value, currentMapping.value),
);

const pullDisabled = computed(() =>
    !currentSrcContext.value
    || !currentMapping.value?.path
    || serverStatus.value !== 'online'
    || port.value === 0
    || pulling.value,
);

const statusOnline = computed(() => serverStatus.value === 'online');

function updateCurrentSrcFromUrl(url: string): void {
  try {
    const ctx = parseSrcPage(new URL(url));
    currentSrcContext.value = ctx;
    currentSrc.value = ctx?.name ?? NONE();
  } catch {
    currentSrcContext.value = null;
    currentSrc.value = NONE();
  }
}

function applyTabUrl(url: string | undefined): void {
  if (!url?.startsWith('http')) {
    currentHost.value = null;
    currentSrc.value = NONE();
    currentSrcContext.value = null;
    selectedProjectPath.value = null;
    currentMapping.value = null;
    projects.value = [];
    return;
  }

  const host = extractNsdHost(url);
  updateCurrentSrcFromUrl(url);

  if (host !== currentHost.value) {
    currentHost.value = host;
    if (host) {
      void refreshHostContext(host);
    } else {
      selectedProjectPath.value = null;
      currentMapping.value = null;
      projects.value = [];
    }
  }
}

async function refreshHostContext(host: string): Promise<void> {
  await loadProjects(host);
  await syncProjectSelection(host);
}

async function syncProjectSelection(host: string): Promise<void> {
  const mapping = await settings.getProjectMapping(host);
  currentMapping.value = mapping ?? null;
  selectedProjectPath.value = mapping?.path ?? null;
}

async function loadProjects(host: string): Promise<void> {
  projectsLoading.value = true;
  projectsError.value = null;

  try {
    const result = await loadProjectsForHost(port.value, host);
    projects.value = result.projects;
    if (result.error === 'port_disabled') {
      projectsError.value = t('serverPortDisabled');
    } else if (result.error === 'load_failed') {
      projectsError.value = t('projectsLoadFailed');
    }
  } finally {
    projectsLoading.value = false;
  }
}

async function onProjectSelect(path: string | null): Promise<void> {
  const host = currentHost.value;
  if (!host) return;

  if (!path) {
    await settings.deleteProjectMapping(host);
    currentMapping.value = null;
    selectedProjectPath.value = null;
    return;
  }

  const mapping = await applyProjectMapping(host, path, projects.value);
  if (!mapping) return;

  currentMapping.value = mapping;
  selectedProjectPath.value = path;
}

async function handlePull(): Promise<void> {
  const ctx = currentSrcContext.value;
  const projectPath = currentMapping.value?.path;

  if (!ctx || !projectPath || pulling.value) {
    if (!projectPath) {
      notifications.error(t('pullErrorTitle'), t('pullNoProject'));
    }
    return;
  }

  pulling.value = true;
  try {
    await pull(port.value, {
      projectPath,
      type: ctx.apiType,
      code: ctx.name,
    });
    notifications.info(t('pullSuccessTitle'), t('pullSuccessMessage'));
  } catch (err) {
    console.log('Pull failed', err);
    notifications.error(t('pullErrorTitle'), t('pullErrorMessage'));
  } finally {
    pulling.value = false;
  }
}

function onRuntimeMessage(msg: unknown): void {
  if (!isRuntimeMessage(msg) || msg.type !== 'URL_UPDATED') return;
  applyTabUrl(msg.url);
}

function onStorageChanged(
    changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
    area: string,
): void {
  if (area !== 'local') return;

  if (changes.port) {
    port.value = (changes.port.newValue as number | undefined) ?? 0;
    if (currentHost.value) {
      void loadProjects(currentHost.value);
    }
  }

  if (changes.projectMappings && currentHost.value) {
    void syncProjectSelection(currentHost.value);
  }
}

onMounted(async () => {
  port.value = await settings.getPort()
  await initServerStatus();

  browser.runtime.onMessage.addListener(onRuntimeMessage);
  browser.storage.onChanged.addListener(onStorageChanged);

  const [tab] = await browser.tabs.query({active: true, currentWindow: true})
  applyTabUrl(tab?.url);
});

onUnmounted(() => {
  browser.runtime.onMessage.removeListener(onRuntimeMessage);
  browser.storage.onChanged.removeListener(onStorageChanged);
  disposeServerStatus();
});
</script>

<template>
  <div class="popup">
    <header class="popup__header">
      <span class="popup__server">{{ t('serverLabel') }}:{{ port }}</span>
      <button
          type="button"
          class="popup__status-dot"
          :class="statusOnline ? 'popup__status-dot--online' : 'popup__status-dot--offline'"
          :title="statusOnline ? t('online') : t('offline')"
          @click="manualCheck"
      />
    </header>

    <main class="popup__body">
      <section class="field">
        <div class="field__label">{{ t('currentHost') }}</div>
        <div class="field__value">{{ currentHost ?? NONE() }}</div>
      </section>

      <section class="field">
        <div class="field__label">{{ t('project') }}</div>
        <div class="field__value">
          <NSelect :value="selectedProjectPath"
                   :options="projectOptions"
                   :loading="projectsLoading"
                   :disabled="!currentHost"
                   :placeholder="t('selectProject')"
                   filterable
                   clearable
                   size="small"
                   @update:value="onProjectSelect"/>
          <p v-if="projectsError" class="field__error">{{ projectsError }}</p>
        </div>
      </section>

      <section class="field">
        <div class="field__label">{{ t('currentSrc') }}</div>
        <div class="field__value field__value--row">
          <span class="field__src">{{ currentSrc }}</span>
          <NButton
              size="tiny"
              type="primary"
              :disabled="pullDisabled"
              :loading="pulling"
              @click="handlePull"
          >
            {{ t('pull') }}
          </NButton>
        </div>
      </section>
    </main>

    <footer class="popup__footer">
      <NButton
          tag="a"
          :href="optionsUrl"
          target="_blank"
          size="small"
          secondary
          class="popup__settings-btn"
      >
        {{ t('settings') }}
      </NButton>
      <span class="popup__info">{{ t('extensionTitle') }}</span>
    </footer>
  </div>
</template>

<style scoped>
.popup {
  display: flex;
  flex-direction: column;
  width: 320px;
  min-height: 240px;
  background: var(--popup-bg);
  color: var(--popup-text);
}

.popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--popup-border);
}

.popup__server {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.popup__status-dot {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.popup__status-dot:hover {
  transform: scale(1.1);
}

.popup__status-dot--online {
  background: #18a058;
  box-shadow: 0 0 0 3px rgba(24, 160, 88, 0.25);
}

.popup__status-dot--offline {
  background: #d03050;
  box-shadow: 0 0 0 3px rgba(208, 48, 80, 0.25);
}

.popup__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--popup-muted);
}

.field__value {
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
}

.field__value--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field__src {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field__error {
  margin: 4px 0 0;
  font-size: 11px;
  color: #d03050;
}

.popup__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--popup-border);
}

.popup__settings-btn {
  font-weight: 500;
}

.popup__info {
  font-size: 11px;
  color: var(--popup-muted);
}
</style>
