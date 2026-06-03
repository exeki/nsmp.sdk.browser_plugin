import {ref, watch, type Ref} from 'vue';
import {
    fetchHistoryPage,
    type HistoryItem,
    type SrcPageContext,
} from '@/utils/history';
import {settings} from '@/utils/settings';

export function useHistory(pageContext: Ref<SrcPageContext | null>) {
    const items = ref<HistoryItem[]>([]);
    const total = ref(0);
    const page = ref(1);
    const loading = ref(false);
    const loadingMore = ref(false);
    const collapsed = ref(false);

    const canLoadMore = () =>
        items.value.length < total.value && !loading.value && !loadingMore.value;

    const loadPage = async (pageNum: number, append: boolean) => {
        const ctx = pageContext.value;
        if (!ctx) return;

        if (append) loadingMore.value = true;
        else loading.value = true;

        try {
            const data = await fetchHistoryPage(ctx.apiType, ctx.name, pageNum);
            if (!data) return;
            total.value = data.total;
            page.value = pageNum;
            items.value = append ? [...items.value, ...data.items] : data.items;
        } finally {
            loading.value = false;
            loadingMore.value = false;
        }
    };

    const reload = async () => {
        items.value = [];
        total.value = 0;
        page.value = 1;
        await loadPage(1, false);
    };

    const loadMore = async () => {
        if (!canLoadMore()) return;
        await loadPage(page.value + 1, true);
    };

    const toggleCollapsed = async () => {
        collapsed.value = !collapsed.value;
        await settings.setHistoryPanelCollapsed(collapsed.value);
    };

    watch(
        pageContext,
        async (ctx) => {
            if (!ctx) {
                items.value = [];
                return;
            }
            await reload();
        },
        {immediate: true},
    );

    settings.getHistoryPanelCollapsed().then((v) => {
        collapsed.value = v;
    });

    return {
        items,
        total,
        loading,
        loadingMore,
        collapsed,
        loadMore,
        reload,
        toggleCollapsed,
        canLoadMore,
    };
}
