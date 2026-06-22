import {defineConfig} from 'wxt';

export default defineConfig({
    modules: ['@wxt-dev/module-vue'],
    manifest: {
        name: '__MSG_extensionTitle__',
        description: 'Browser plugin for NSMP SDK',
        options_page: 'options.html',
        default_locale: 'en',
        permissions: ['notifications', 'storage', 'tabs'],
        host_permissions: ['http://127.0.0.1/*', '*://*/sd/admin/*'],
    },
});
