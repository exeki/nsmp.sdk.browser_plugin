
export default defineContentScript({
    matches: ['*://*.google.com/*', 'https://yandex.ru/*'],
    main() {
        console.log('Hello content.');
        browser.runtime.sendMessage({
            type: 'SHOW_NOTIFICATION',
            payload: {
                title: 'Action Required',
                message: 'Your background task has successfully completed!',
            },
        });
    },
});
