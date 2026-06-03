export default defineContentScript({
    matches: ['*://*/sd/admin/*'],
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
