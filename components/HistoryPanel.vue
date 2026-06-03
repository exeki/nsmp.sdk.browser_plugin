<script lang="ts" setup>
import {inject, type Ref} from 'vue';
import {useHistory} from '@/composables/useHistory';
import {
  adminLogRecordUrl,
  formatDescriptionPreview,
  type SrcPageContext,
} from '@/utils/history';
import {t} from '@/utils/i18n';

const pageContext = inject<Ref<SrcPageContext | null>>('pageContext')!;

const {
  items,
  loading,
  loadingMore,
  collapsed,
  total,
  loadMore,
  toggleCollapsed,
} = useHistory(pageContext);

const openRecord = (uuid: string) => {
  window.location.href = adminLogRecordUrl(uuid);
};

const onScroll = (e: Event) => {
  const el = e.target as HTMLElement;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
    loadMore();
  }
};
</script>

<template>
  <aside class="nsmp-history" :class="{ 'nsmp-history--collapsed': collapsed }">
    <header class="nsmp-history__header">
      <button
        type="button"
        class="nsmp-history__toggle"
        :title="collapsed ? t('historyExpand') : t('historyCollapse')"
        @click="toggleCollapsed"
      >
        {{ collapsed ? '‹' : '›' }}
      </button>
      <h2 v-if="!collapsed" class="nsmp-history__title">{{ t('historyTitle') }}</h2>
    </header>

    <div v-if="!collapsed" class="nsmp-history__body" @scroll="onScroll">
      <div v-if="loading && items.length === 0" class="nsmp-history__status">
        {{ t('historyLoading') }}
      </div>

      <div v-else-if="!loading && items.length === 0" class="nsmp-history__status">
        {{ t('historyEmpty') }}
      </div>

      <ul v-else class="nsmp-history__list">
        <li
          v-for="item in items"
          :key="item.uuid"
          class="nsmp-history__item"
          @click="openRecord(item.uuid)"
        >
          <div class="nsmp-history__meta">
            <span>{{ item.actionDate }}</span>
            <span class="nsmp-history__sep">·</span>
            <span>{{ item.authorLogin }}</span>
            <span class="nsmp-history__sep">·</span>
            <span>{{ item.categoryName }}</span>
          </div>
          <div class="nsmp-history__desc">
            {{ formatDescriptionPreview(item.description) }}
          </div>
        </li>
      </ul>

      <div v-if="items.length > 0" class="nsmp-history__footer">
        <span v-if="loadingMore">{{ t('historyLoading') }}</span>
        <span v-else-if="items.length >= total" class="nsmp-history__end">{{ t('historyEnd') }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nsmp-history {
  --nsmp-bg: #f8f9fb;
  --nsmp-border: #d8dee8;
  --nsmp-text: #1a1d21;
  --nsmp-muted: #5c6570;
  --nsmp-hover: #eef2f7;
  --nsmp-accent: #2563eb;

  display: flex;
  flex-direction: column;
  width: 340px;
  max-width: 40vw;
  height: 100vh;
  background: var(--nsmp-bg);
  border-left: 1px solid var(--nsmp-border);
  color: var(--nsmp-text);
  font: 13px/1.4 system-ui, -apple-system, Segoe UI, sans-serif;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  .nsmp-history {
    --nsmp-bg: #1e2228;
    --nsmp-border: #3a424d;
    --nsmp-text: #e8eaed;
    --nsmp-muted: #9aa3ad;
    --nsmp-hover: #2a3038;
    --nsmp-accent: #60a5fa;
  }
}

.nsmp-history--collapsed {
  width: 36px;
  max-width: 36px;
}

.nsmp-history__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--nsmp-border);
  flex-shrink: 0;
}

.nsmp-history__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nsmp-history__toggle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid var(--nsmp-border);
  border-radius: 6px;
  background: transparent;
  color: var(--nsmp-text);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.nsmp-history__toggle:hover {
  background: var(--nsmp-hover);
}

.nsmp-history__body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.nsmp-history__status {
  padding: 16px 12px;
  color: var(--nsmp-muted);
  text-align: center;
}

.nsmp-history__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nsmp-history__item {
  padding: 10px 12px;
  border-bottom: 1px solid var(--nsmp-border);
  cursor: pointer;
}

.nsmp-history__item:hover {
  background: var(--nsmp-hover);
}

.nsmp-history__meta {
  font-size: 12px;
  color: var(--nsmp-muted);
  margin-bottom: 4px;
  word-break: break-word;
}

.nsmp-history__sep {
  margin: 0 4px;
}

.nsmp-history__desc {
  font-size: 13px;
  color: var(--nsmp-text);
  word-break: break-word;
}

.nsmp-history__footer {
  padding: 12px;
  text-align: center;
  color: var(--nsmp-muted);
  font-size: 12px;
}

.nsmp-history__end {
  opacity: 0.7;
}
</style>
