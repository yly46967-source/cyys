import authState from './auth-state.js';
import { initSharedLayout } from './shared-layout.js';

/**
 * 更新基于角色的元素显示
 * 注意：此函数处理基础的 role-based 显示，具体页面可能需要额外的逻辑
 * 例如任务详情页的按钮状态会由 renderAcceptTaskAction() 进一步处理
 */
function updateRoleElements(root = document) {
    const currentRole = authState.currentUser?.role || null;

    root.querySelectorAll('[data-show-role]').forEach(element => {
        const expectedRole = element.dataset.showRole;
        element.style.display = expectedRole && currentRole === expectedRole ? '' : 'none';
    });
}

function initTaskPage(options = {}) {
    const { activePage = 'home' } = options;

    window.authState = authState;
    initSharedLayout(activePage);
    updateRoleElements(document);

    authState.subscribe(event => {
        if (event === authState.EVENTS.LOGIN ||
            event === authState.EVENTS.LOGOUT ||
            event === authState.EVENTS.USER_UPDATE ||
            event === authState.EVENTS.REAL_NAME_STATUS) {
            updateRoleElements(document);
        }
    });
}

export { initTaskPage, updateRoleElements };
