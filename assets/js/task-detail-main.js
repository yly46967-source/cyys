import { initTaskPage } from './task-page-auth.js';

function initTaskDetailPage() {
    initTaskPage({ activePage: 'task-hall' });

    if (typeof window.initTaskDetail === 'function') {
        window.initTaskDetail();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTaskDetailPage);
} else {
    initTaskDetailPage();
}
