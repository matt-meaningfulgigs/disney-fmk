// Test URL parameters
document.addEventListener('DOMContentLoaded', () => {
    // Get all action buttons
    const actionButtons = document.querySelectorAll('[data-action]');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const btn = event.target as HTMLButtonElement;
            const action = btn.dataset.action;
            const character = btn.dataset.character;
            
            // Update URL with action
            const url = new URL(window.location.href);
            url.searchParams.set(`character${character}`, action || '');
            window.history.pushState({}, '', url.toString());
            
            // Disable the clicked button and its siblings
            const siblingButtons = btn.parentElement?.querySelectorAll('button');
            siblingButtons?.forEach(sibling => {
                sibling.disabled = true;
            });
            
            console.log('URL updated:', url.toString());
        });
    });
    
    // Log current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    urlParams.forEach((value, key) => {
        params[key] = value;
        
        // If we have a parameter, update the UI
        if (key.startsWith('character')) {
            const characterNum = key.replace('character', '');
            const buttons = document.querySelectorAll(`[data-character="${characterNum}"]`);
            buttons.forEach(button => {
                const btn = button as HTMLButtonElement;
                if (btn.dataset.action === value) {
                    btn.click();
                }
            });
        }
    });
    console.log('Current URL parameters:', params);
}); 
