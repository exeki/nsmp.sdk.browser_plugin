import {createApp, ref, type App, type Ref} from 'vue';
import {createIntegratedUi} from 'wxt/utils/content-script-ui/integrated';
import HistoryPanel from '@/components/HistoryPanel.vue';
import {parseSrcPage, type SrcPageContext} from '@/utils/history';

export default defineContentScript({
    matches: ['*://*/sd/admin/*'],
    async main(ctx) {
        const pageContext = ref<SrcPageContext | null>(parseSrcPage(window.location));
        let ui: ReturnType<typeof createIntegratedUi<App>> | undefined;

        const sync = async () => {
            pageContext.value = parseSrcPage(window.location);

            if (!pageContext.value) {
                ui?.remove();
                ui = undefined;
                return;
            }

            if (!ui) {
                ui = createIntegratedUi(ctx, {
                    position: 'overlay',
                    alignment: 'top-right',
                    zIndex: 100000,
                    onMount(wrapper) {
                        Object.assign(wrapper.style, {
                            position: 'fixed',
                            top: '0',
                            right: '0',
                            height: '100vh',
                            pointerEvents: 'auto',
                        });

                        const app = createApp(HistoryPanel);
                        app.provide<Ref<SrcPageContext | null>>('pageContext', pageContext);
                        app.mount(wrapper);
                        return app;
                    },
                    onRemove(app) {
                        app?.unmount();
                    },
                });
            }

            ui.mount();
        };

        window.addEventListener('hashchange', () => void sync());
        await sync();
    },
});
