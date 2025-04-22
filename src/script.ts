// Test URL parameters
document.addEventListener('DOMContentLoaded', () => {
    // Get the first Fuck button
    const fuckButton = document.querySelector('[data-action="fuck"]');
    
    if (fuckButton) {
        fuckButton.addEventListener('click', () => {
            // Update URL with test parameters
            const url = new URL(window.location.href);
            url.searchParams.set('test', 'working');
            window.history.pushState({}, '', url.toString());
            console.log('URL updated:', url.toString());
        });
    }
    
    // Log current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    console.log('Current URL parameters:', params);
}); 
