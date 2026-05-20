import {defineConfig} from 'wxt';

// See r
export default defineConfig({
    modules: ['@wxt-dev/module-vue'],
    manifest: {
        name: '__MSG_extensionTitle__',
        description: 'Browser plugin for NSMP SDK',
        options_page: 'options.html',
        default_locale: 'en',
    },
});
