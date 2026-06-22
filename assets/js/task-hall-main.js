import { initTaskPage } from './task-page-auth.js';

function initAll() {
    initTaskPage({ activePage: 'task-hall' });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
