import {resolve} from 'node:path';
import {defineConfig} from 'wxt';

export default defineConfig({
    manifestVersion: 3,
    modules: ['@wxt-dev/module-vue'],
    webExt: {
        keepProfileChanges: true,
        chromiumProfile: resolve('.wxt/chrome-data'),
    },
    manifest: {
        name: '__MSG_extensionTitle__',
        description: 'Browser plugin for NSMP SDK',
        options_page: 'options.html',
        default_locale: 'en',
        permissions: ['notifications', 'storage', 'tabs'],
        host_permissions: ['http://127.0.0.1/*', '*://*/sd/admin/*'],
        browser_specific_settings: {
            gecko: {
                data_collection_permissions: {
                    required: ['websiteActivity'],
                },
            },
        },
    },
});
