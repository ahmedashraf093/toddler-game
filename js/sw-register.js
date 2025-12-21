if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker Registered');

                // Check for updates periodically
                setInterval(() => {
                    reg.update();
                }, 60 * 60 * 1000); // Check every hour
            })
            .catch(err => console.log('SW Registration Failed:', err));
    });

    // Force reload when new SW takes control
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}

let deferredPrompt;
const installContainer = document.getElementById('install-container');
const btnInstall = document.getElementById('btnInstall');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Add 'show' class to display the button (subject to CSS media query)
    installContainer.classList.add('show');
    console.log("Install prompt is ready to be triggered");
});

btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) {
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    installContainer.classList.remove('show');
});

window.checkForUpdates = async () => {
    const btn = document.getElementById('update-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳'; // Loading spinner or hour glass
    btn.disabled = true;

    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
                await reg.update();
                // If update found, controllerchange will fire and reload.
                // If not, we restore the button after a short delay.
                setTimeout(() => {
                    btn.innerHTML = '✅'; // Success check
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2000);
                }, 1000);
            } else {
                // alert('Service Worker not registered.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (e) {
            console.error('Update check failed:', e);
            btn.innerHTML = '❌';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }
    } else {
        // alert('Service Worker not supported.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};
